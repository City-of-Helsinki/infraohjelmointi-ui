import mockI18next from '@/mocks/mockI18next';
import { mockPlanningPhases, mockProjectPhases } from '@/mocks/mockLists';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import MyWorkloadEditDialog from './MyWorkloadEditDialog';

const mockNavigate = jest.fn();
const mockPatchProject = jest.fn();
let consoleErrorSpy: jest.SpyInstance;

jest.mock('react-i18next', () => mockI18next());

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
};

const renderDialog = (
  viewType: 'planning' | 'construction',
  project: MyWorkloadTableRow | null = baseProject,
) => {
  const store = setupStore();
  const onClose = jest.fn();
  const onSave = jest.fn();

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

  it('accepts valid date format without leading zeros from datepicker and normalizes payload', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          estPlanningStart: '2026-07-01',
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
      planningStart: '1.7.2026',
    };

    const { user, getByRole } = renderDialog('planning', projectWithSingleDigitDate);

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: expect.objectContaining({
          estPlanningStart: '01.07.2026',
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
            id: mockProjectPhases.data[7].id,
            value: 'construction',
          },
        }),
    });

    const { user, getByRole } = renderDialog('construction', {
      ...baseProject,
      costForecast: '1 000,5€',
      phaseId: mockProjectPhases.data[7].id,
      phaseValue: 'construction',
    });

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: {
          phase: mockProjectPhases.data[7].id,
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
