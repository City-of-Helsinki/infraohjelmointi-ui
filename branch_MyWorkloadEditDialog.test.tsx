import { mockPlanningPhases, mockProjectPhases } from '@/mocks/mockLists';
import mockProject from '@/mocks/mockProject';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import fi from '@/i18n/fi.json';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import MyWorkloadEditDialog from './MyWorkloadEditDialog';

const mockNavigate = jest.fn();
const mockPatchProject = jest.fn();
const mockGetProjectByIdQuery = jest.fn();
let consoleErrorSpy: jest.SpyInstance;

jest.mock('react-i18next', () => {
  const fi = require('@/i18n/fi.json');
  const translate = (key: string, options?: Record<string, string>) => {
    const translationMap: Record<string, string> = {
      'myWorkloadView.table.projectBasicsValidationNotificationTitle':
        fi.myWorkloadView.table.projectBasicsValidationNotificationTitle,
      'myWorkloadView.table.projectBasicsValidationNotificationText':
        fi.myWorkloadView.table.projectBasicsValidationNotificationText,
      'myWorkloadView.table.goToProjectBasicsToFixValidation':
        fi.myWorkloadView.table.goToProjectBasicsToFixValidation,
      'validation.isBefore': fi.validation.isBefore,
      'validation.estPlanningEnd': fi.validation.estPlanningEnd,
      'validation.programmed': fi.validation.programmed,
      'validation.planningStartYear': fi.validation.planningStartYear,
      'validation.constructionEndYear': fi.validation.constructionEndYear,
      'validation.category': fi.validation.category,
      'validation.priority': fi.validation.priority,
      'validation.masterClass': fi.validation.masterClass,
      'validation.class': fi.validation.class,
      'validation.phase': fi.validation.phase,
      'validation.phaseDetail': fi.validation.phaseDetail,
      'validation.address': 'Katuosoite',
      'validation.personPlanning': fi.validation.personPlanning,
      'validation.personConstruction': fi.validation.personConstruction,
      'validation.estWarrantyPhaseStart': fi.validation.estWarrantyPhaseStart,
      'validation.estWarrantyPhaseEnd': fi.validation.estWarrantyPhaseEnd,
    };

    let value = translationMap[key] ?? key;
    Object.entries(options ?? {}).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{{${paramKey}}}`, paramValue);
    });
    return value;
  };

  return {
    useTranslation: () => ({
      t: translate,
      i18n: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        changeLanguage: () => new Promise(() => {}),
      },
    }),
    Trans: ({ i18nKey, children }: { i18nKey?: string; children?: unknown }) =>
      children ?? i18nKey ?? null,
  };
});

jest.mock('react-router-dom', () => {
  const actualModule = jest.requireActual('react-router-dom');
  return {
    ...actualModule,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('@/api/projectApi', () => {
  const actualModule = jest.requireActual('@/api/projectApi');
  return {
    ...actualModule,
    usePatchProjectMutation: () => [mockPatchProject, { isLoading: false }],
    useGetProjectByIdQuery: (...args: unknown[]) => mockGetProjectByIdQuery(...args),
  };
});

const baseProject: MyWorkloadTableRow = {
  id: 'project-1',
  projectName: 'My test project',
  description: 'Desc',
  planningStart: '01.01.2026',
  planningEnd: '31.12.2026',
  presenceStart: '01.02.2026',
  presenceEnd: '30.11.2026',
  visibilityStart: '01.03.2026',
  visibilityEnd: '31.10.2026',
  constructionStart: '01.04.2027',
  constructionEnd: '31.10.2027',
  projectCostForecast: '800',
  planningCostForecast: '300',
  planningPhaseId: mockPlanningPhases.data[0].id,
  planningWorkQuantity: '150',
  constructionCostForecast: '500',
  costForecast: '1000',
  phase: 'option.design',
  phaseValue: 'design',
  phaseId: mockProjectPhases.data[1].id,
  functions: 'myWorkloadView.table.modifyInformation',
  budget: '',
  constructionProcurementMethod: undefined,
};

const createFullProject = (overrides: Partial<IProject> = {}): IProject => ({
  ...mockProject.data,
  id: baseProject.id,
  name: baseProject.projectName,
  projectClass: 'mock-project-class-id',
  estPlanningStart: baseProject.planningStart,
  estPlanningEnd: baseProject.planningEnd,
  presenceStart: baseProject.presenceStart,
  presenceEnd: baseProject.presenceEnd,
  visibilityStart: baseProject.visibilityStart,
  visibilityEnd: baseProject.visibilityEnd,
  estConstructionStart: baseProject.constructionStart,
  estConstructionEnd: baseProject.constructionEnd,
  phase: {
    id: baseProject.phaseId,
    value: baseProject.phaseValue,
  },
  ...overrides,
});

const renderDialog = (
  viewType: 'planning' | 'construction',
  project: MyWorkloadTableRow | null = baseProject,
  fullProject: IProject | null = createFullProject(),
) => {
  const store = setupStore();
  const onClose = jest.fn();
  const onSave = jest.fn();

  mockGetProjectByIdQuery.mockReturnValue({
    data: fullProject,
    isFetching: false,
  });

  const renderResult = renderWithProviders(
    <Route
      path="*"
      element={
        <MyWorkloadEditDialog
          isOpen={true}
          project={project}
          viewType={viewType}
          onClose={onClose}
          onSave={onSave}
        />
      }
    />,
    {
      preloadedState: {
        lists: {
          ...store.getState().lists,
          phases: mockProjectPhases.data,
          planningPhases: mockPlanningPhases.data,
        },
      },
    },
  );

  return { ...renderResult, onClose, onSave };
};

describe('MyWorkloadEditDialog', () => {
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      const firstArg = String(args[0] ?? '');
      if (firstArg.includes('Could not parse CSS stylesheet')) {
        return;
      }
      // eslint-disable-next-line no-console
      console.warn(...args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks submit when required planning dates are missing', async () => {
    const projectWithMissingRequiredDate = {
      ...baseProject,
      planningStart: '',
    };

    const { user, getByRole, queryByText } = renderDialog(
      'planning',
      projectWithMissingRequiredDate,
    );

    await user.click(getByRole('button', { name: 'save' }));

    expect(mockPatchProject).not.toHaveBeenCalled();
    expect(queryByText('myWorkloadView.table.requiredField')).toBeInTheDocument();
  });

  it('clears validation errors when dialog is closed', async () => {
    const projectWithMissingRequiredDate = {
      ...baseProject,
      planningStart: '',
    };

    const { user, getByRole, queryByText, onClose } = renderDialog(
      'planning',
      projectWithMissingRequiredDate,
    );

    await user.click(getByRole('button', { name: 'save' }));
    expect(queryByText('myWorkloadView.table.requiredField')).toBeInTheDocument();

    await user.click(getByRole('button', { name: 'cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(queryByText('myWorkloadView.table.requiredField')).not.toBeInTheDocument();
  });

  it('blocks submit when date format is invalid', async () => {
    const projectWithInvalidDate = {
      ...baseProject,
      planningStart: '31-12-2026',
    };

    const { user, getByRole, queryByText } = renderDialog('planning', projectWithInvalidDate);

    await user.click(getByRole('button', { name: 'save' }));

    expect(mockPatchProject).not.toHaveBeenCalled();
    expect(queryByText('myWorkloadView.table.invalidDate')).toBeInTheDocument();
  });

  it('shows a normal field error for visible validation issues without notification', async () => {
    const projectWithInvalidDateOrder = {
      ...baseProject,
      planningStart: '31.12.2026',
      planningEnd: '01.01.2026',
    };

    const { user, getByRole, queryByText, queryAllByText } = renderDialog(
      'planning',
      projectWithInvalidDateOrder,
    );

    await user.click(getByRole('button', { name: 'save' }));
    await waitFor(() => {
      expect(
        queryAllByText(fi.validation.isBefore.replace('{{value}}', fi.validation.estPlanningEnd)).length,
      ).toBeGreaterThan(0);
    });

    expect(mockPatchProject).not.toHaveBeenCalled();
    expect(
      queryAllByText(fi.validation.isBefore.replace('{{value}}', fi.validation.estPlanningEnd)).length,
    ).toBeGreaterThan(0);
    expect(
      queryByText(fi.myWorkloadView.table.projectBasicsValidationNotificationTitle),
    ).not.toBeInTheDocument();
  });

  it('blocks submit with hidden field notification and navigates to project basics', async () => {
    const warrantyPhase = mockProjectPhases.data.find((phase) => phase.value === 'warrantyPeriod');
    const projectInWarrantyPhase = {
      ...baseProject,
      planningStart: '01.01.2022',
      planningEnd: '31.12.2022',
      presenceStart: '01.02.2022',
      presenceEnd: '30.11.2022',
      visibilityStart: '01.03.2022',
      visibilityEnd: '31.10.2022',
      constructionStart: '01.04.2023',
      constructionEnd: '31.10.2023',
      phaseId: warrantyPhase?.id ?? baseProject.phaseId,
      phaseValue: 'warrantyPeriod',
    };
    const fullProjectWithMissingConstructionEndYear = createFullProject({
      estPlanningStart: '01.01.2022',
      estPlanningEnd: '31.12.2022',
      presenceStart: '01.02.2022',
      presenceEnd: '30.11.2022',
      visibilityStart: '01.03.2022',
      visibilityEnd: '31.10.2022',
      estConstructionStart: '01.04.2023',
      estConstructionEnd: '31.10.2023',
      // The original (pre-edit) project is still in the construction phase, which does
      // not require constructionEndYear. The dialog submits a phase change to
      // warrantyPeriod, which does require it - this is the "new" hidden issue we expect
      // getNewProjectValidationIssues to surface.
      phase: {
        id: baseProject.phaseId,
        value: 'construction',
      },
      constructionEndYear: null,
    });

    const { user, getByRole, getByText, onClose } = renderDialog(
      'construction',
      projectInWarrantyPhase,
      fullProjectWithMissingConstructionEndYear,
    );

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(
        getByText(fi.myWorkloadView.table.projectBasicsValidationNotificationTitle),
      ).toBeInTheDocument();
    });

    expect(mockPatchProject).not.toHaveBeenCalled();
    expect(
      getByText(
        fi.myWorkloadView.table.projectBasicsValidationNotificationText.replace(
          '{{fields}}',
          fi.validation.constructionEndYear,
        ),
      ),
    ).toBeInTheDocument();

    const actionButton = getByRole('button', {
      name: fi.myWorkloadView.table.goToProjectBasicsToFixValidation,
    });
    expect(actionButton).toBeInTheDocument();

    await user.click(actionButton);

    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/project/project-1/basics');
  });

  it('accepts valid date format without leading zeros from datepicker and normalizes payload', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          estPlanningStart: '2026-01-01',
          estPlanningEnd: '2026-12-31',
          presenceStart: '2026-02-01',
          presenceEnd: '2026-11-30',
          visibilityStart: '2026-03-01',
          visibilityEnd: '2026-10-31',
          estConstructionStart: '2027-04-01',
          estConstructionEnd: '2027-10-31',
          projectCostForecast: '801',
          planningCostForecast: '301',
          planningPhase: { id: mockPlanningPhases.data[1].id },
          planningWorkQuantity: '151',
          constructionCostForecast: '501',
          costForecast: '1001.00',
          phase: {
            id: mockProjectPhases.data[2].id,
            value: 'programming',
          },
        }),
    });

    const projectWithSingleDigitDate = {
      ...baseProject,
      planningStart: '1.1.2026',
    };

    const { user, getByRole } = renderDialog('planning', projectWithSingleDigitDate);

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: expect.objectContaining({
          estPlanningStart: '01.01.2026',
        }),
      });
    });
  });

  it('submits planning payload and maps response values back to onSave', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          estPlanningStart: '2026-01-01',
          estPlanningEnd: '2026-12-31',
          presenceStart: '2026-02-01',
          presenceEnd: '2026-11-30',
          visibilityStart: '2026-03-01',
          visibilityEnd: '2026-10-31',
          estConstructionStart: '2027-04-01',
          estConstructionEnd: '2027-10-31',
          projectCostForecast: '801',
          planningCostForecast: '301',
          planningPhase: { id: mockPlanningPhases.data[1].id },
          planningWorkQuantity: '151',
          constructionCostForecast: '501',
          costForecast: '1001.00',
          phase: {
            id: mockProjectPhases.data[2].id,
            value: 'programming',
          },
        }),
    });

    const { user, getByRole, onClose, onSave, store } = renderDialog('planning');

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: {
          phase: baseProject.phaseId,
          estPlanningStart: '01.01.2026',
          estPlanningEnd: '31.12.2026',
          presenceStart: '01.02.2026',
          presenceEnd: '30.11.2026',
          visibilityStart: '01.03.2026',
          visibilityEnd: '31.10.2026',
          projectCostForecast: '800',
          planningCostForecast: '300',
          planningPhase: baseProject.planningPhaseId,
          planningWorkQuantity: '150',
          constructionCostForecast: '500',
        },
      });
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: baseProject.id,
          planningStart: '01.01.2026',
          planningEnd: '31.12.2026',
          phase: 'option.programming',
          phaseValue: 'programming',
          phaseId: mockProjectPhases.data[2].id,
        }),
      );
    });

    expect(onClose).toHaveBeenCalled();
    expect(store.getState().notifications[0].message).toBe('patchSuccess');
  });

  it('submits construction payload with normalized cost forecast', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          estConstructionStart: '2027-04-01',
          estConstructionEnd: '2027-10-31',
          costForecast: '1000.50',
          phase: {
            id: mockProjectPhases.data[5].id,
            value: 'construction',
          },
        }),
    });

    const { user, getByRole } = renderDialog('construction', {
      ...baseProject,
      costForecast: '1 000,5Ôé¼',
      phaseId: mockProjectPhases.data[5].id,
      phaseValue: 'construction',
    });

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: {
          phase: mockProjectPhases.data[5].id,
          estConstructionStart: '01.04.2027',
          estConstructionEnd: '31.10.2027',
          costForecast: '1000.50',
        },
      });
    });
  });

  it('dispatches patch error notification on failed save', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('patch failed')),
    });

    const { user, getByRole, onClose, store } = renderDialog('construction');

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(store.getState().notifications[0].message).toBe('patchError');
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('navigates to project card edit from footer action', async () => {
    const { user, getByRole, onClose } = renderDialog('planning');

    await user.click(getByRole('button', { name: 'myWorkloadView.table.goToProjectCardEdit' }));

    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/project/project-1/basics');
  });
});
