import mockI18next from '@/mocks/mockI18next';
import {
  mockConstructionPhases,
  mockPlanningPhases,
  mockProjectPhaseDetails,
  mockProjectPhases,
} from '@/mocks/mockLists';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import MyWorkloadEditDialog from './MyWorkloadEditDialog';

const mockNavigate = jest.fn();
const mockPatchProject = jest.fn();
const mockGetProjectById = jest.fn();
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
    useGetProjectByIdQuery: () => mockGetProjectById(),
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
  planningCostForecast: '300',
  planningPhaseId: mockPlanningPhases.data[0].id,
  planningWorkQuantity: '150',
  constructionCostForecast: '500',
  constructionPhaseId: mockConstructionPhases.data[0].id,
  constructionWorkQuantity: '250',
  phase: {
    id: mockProjectPhases.data[1].id,
    label: 'option.design',
    value: 'design',
  },
  phaseDetail: {
    id: '',
    label: '',
    value: '',
  },
  functions: 'myWorkloadView.table.modifyInformation',
  budget: '',
  constructionProcurementMethod: undefined,
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
          projectPhaseDetails: mockProjectPhaseDetails.data,
          planningPhases: mockPlanningPhases.data,
          constructionPhases: mockConstructionPhases.data,
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
    mockGetProjectById.mockReturnValue({ data: undefined, isFetching: false });
  });

  it('blocks submit when required planning dates are missing', async () => {
    const projectWithMissingRequiredDate = {
      ...baseProject,
      planningStart: '',
    };

    const { user, getByRole, getAllByText } = renderDialog(
      'planning',
      projectWithMissingRequiredDate,
    );

    await user.click(getByRole('button', { name: 'save' }));

    expect(mockPatchProject).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getAllByText('myWorkloadView.table.requiredField').length).toBeGreaterThan(0);
    });
  });

  it('clears validation errors when dialog is closed', async () => {
    const projectWithMissingRequiredDate = {
      ...baseProject,
      planningStart: '',
    };

    const { user, getByRole, getAllByText, queryAllByText, onClose } = renderDialog(
      'planning',
      projectWithMissingRequiredDate,
    );

    await user.click(getByRole('button', { name: 'save' }));
    await waitFor(() => {
      expect(getAllByText('myWorkloadView.table.requiredField').length).toBeGreaterThan(0);
    });

    await user.click(getByRole('button', { name: 'cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(queryAllByText('myWorkloadView.table.requiredField').length).toBe(0);
  });

  it('blocks submit when date format is invalid', async () => {
    const projectWithInvalidDate = {
      ...baseProject,
      planningStart: '31-12-2026',
    };

    const { user, getByRole, getAllByText } = renderDialog('planning', projectWithInvalidDate);

    await user.click(getByRole('button', { name: 'save' }));

    expect(mockPatchProject).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getAllByText('myWorkloadView.table.invalidDate').length).toBeGreaterThan(0);
    });
  });

  it('blocks submit when planning end date is set after construction start date', async () => {
    const { user, getByRole, getByLabelText, getAllByText } = renderDialog('planning');

    const planningEndInput = getByLabelText(/^myWorkloadView\.table\.planningEnd/);
    fireEvent.input(planningEndInput, {
      // baseProject.constructionStart is 01.04.2027
      target: { value: '01.05.2027' },
    });
    fireEvent.blur(planningEndInput);

    await user.click(getByRole('button', { name: 'save' }));

    expect(mockPatchProject).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getAllByText('validation.isBefore').length).toBeGreaterThan(0);
    });
  });

  it('shows phase detail validation through the select when the selected phase has details', async () => {
    const constructionProject = {
      ...baseProject,
      phase: {
        id: mockProjectPhases.data[5].id,
        label: 'option.construction',
        value: 'construction',
      },
      phaseDetail: {
        id: '',
        label: '',
        value: '',
      },
    };

    const { user, getByRole, getAllByText } = renderDialog('construction', constructionProject);

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(getAllByText('validation.required').length).toBeGreaterThan(0);
    });
    expect(mockPatchProject).not.toHaveBeenCalled();
  });

  it('accepts valid date format without leading zeros from datepicker and sends only the changed field', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          estPlanningStart: '2026-01-05',
          phase: {
            id: mockProjectPhases.data[1].id,
            value: 'design',
          },
        }),
    });

    const { user, getByRole, getByLabelText } = renderDialog('planning');

    const planningStartInput = getByLabelText(/^myWorkloadView\.table\.planningStart/);
    fireEvent.input(planningStartInput, {
      target: { value: '5.1.2026' },
    });
    fireEvent.blur(planningStartInput);

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: { estPlanningStart: '05.01.2026' },
      });
    });
  });

  it('does not call the API when nothing was changed', async () => {
    const { user, getByRole, onClose } = renderDialog('planning');

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(mockPatchProject).not.toHaveBeenCalled();
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
          estConstructionStart: '2027-04-01',
          estConstructionEnd: '2027-10-31',
          planningCostForecast: '301',
          planningPhase: { id: mockPlanningPhases.data[1].id },
          planningWorkQuantity: '151',
          phase: {
            id: mockProjectPhases.data[2].id,
            value: 'programming',
          },
        }),
    });

    const { user, getByRole, getByLabelText, onClose, onSave, store } = renderDialog('planning');

    fireEvent.change(getByLabelText(/^myWorkloadView\.table\.workQuantity/), {
      target: { value: '151' },
    });

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: {
          planningWorkQuantity: '151',
        },
      });
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: baseProject.id,
          planningStart: '01.01.2026',
          planningEnd: '31.12.2026',
          phase: expect.objectContaining({
            id: mockProjectPhases.data[2].id,
            label: 'option.programming',
            value: 'programming',
          }),
        }),
      );
    });

    expect(onClose).toHaveBeenCalled();
    expect(store.getState().notifications[0].message).toBe('patchSuccess');
  });

  it('keeps existing row values when patch response omits unchanged fields', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          planningWorkQuantity: '151',
        }),
    });

    const { user, getByRole, getByLabelText, onSave } = renderDialog('planning');

    fireEvent.change(getByLabelText(/^myWorkloadView\.table\.workQuantity/), {
      target: { value: '151' },
    });

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          planningWorkQuantity: '151',
          planningEnd: baseProject.planningEnd,
          presenceStart: baseProject.presenceStart,
          presenceEnd: baseProject.presenceEnd,
          visibilityStart: baseProject.visibilityStart,
          visibilityEnd: baseProject.visibilityEnd,
          constructionStart: baseProject.constructionStart,
          constructionEnd: baseProject.constructionEnd,
          planningCostForecast: baseProject.planningCostForecast,
          planningPhaseId: baseProject.planningPhaseId,
          constructionCostForecast: baseProject.constructionCostForecast,
          constructionPhaseId: baseProject.constructionPhaseId,
          constructionWorkQuantity: baseProject.constructionWorkQuantity,
          phase: baseProject.phase,
          phaseDetail: baseProject.phaseDetail,
        }),
      );
    });
  });

  it('submits construction payload with only the changed field', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          estConstructionStart: '2027-05-01',
          phase: {
            id: mockProjectPhases.data[7].id,
            value: 'construction',
          },
        }),
    });

    const { user, getByRole, getByLabelText } = renderDialog('construction', {
      ...baseProject,
      phase: {
        id: mockProjectPhases.data[7].id,
        label: 'option.construction',
        value: 'construction',
      },
    });

    const constructionStartInput = getByLabelText(/^validation\.estConstructionStart/);
    fireEvent.input(constructionStartInput, {
      target: { value: '1.5.2027' },
    });
    fireEvent.blur(constructionStartInput);

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: {
          estConstructionStart: '01.05.2027',
        },
      });
    });
  });

  it('saves the construction cost estimate row fields on the construction side', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          id: baseProject.id,
          constructionWorkQuantity: '999',
          phase: {
            id: mockProjectPhases.data[7].id,
            value: 'construction',
          },
        }),
    });

    const { user, getByRole, getByLabelText } = renderDialog('construction', {
      ...baseProject,
      phase: {
        id: mockProjectPhases.data[7].id,
        label: 'option.construction',
        value: 'construction',
      },
    });

    fireEvent.change(getByLabelText(/^myWorkloadView\.table\.workQuantity/), {
      target: { value: '999' },
    });

    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockPatchProject).toHaveBeenCalledWith({
        id: baseProject.id,
        data: {
          constructionWorkQuantity: '999',
        },
      });
    });
  });

  it('shows a notification instead of saving when a date edit introduces errors in hidden fields', async () => {
    mockGetProjectById.mockReturnValue({
      data: {
        ...baseProject,
        phase: mockProjectPhases.data[1],
        phaseDetail: null,
        programmed: false,
        planningStartYear: 2026,
        constructionEndYear: 2027,
        estPlanningStart: '2026-01-01',
        estPlanningEnd: '2026-12-31',
        estConstructionStart: '2027-04-01',
        estConstructionEnd: '2027-10-31',
        category: { id: 'category-id' },
        priority: { id: 'priority-id' },
        projectClass: 'class-id',
      },
      isFetching: false,
    });

    const { user, getByRole, getByLabelText, getByText } = renderDialog('construction');

    const constructionEndInput = getByLabelText(/^validation\.estConstructionEnd/);
    fireEvent.input(constructionEndInput, { target: { value: '1.1.2028' } });
    fireEvent.blur(constructionEndInput);
    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(
        getByText('myWorkloadView.table.projectBasicsValidationNotificationTitle'),
      ).toBeInTheDocument();
    });
    expect(mockPatchProject).not.toHaveBeenCalled();
  });

  it('dispatches patch error notification on failed save', async () => {
    mockPatchProject.mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('patch failed')),
    });

    const { user, getByRole, getByLabelText, onClose, store } = renderDialog('construction');

    const constructionStartInput = getByLabelText(/^validation\.estConstructionStart/);
    fireEvent.input(constructionStartInput, {
      target: { value: '1.5.2027' },
    });
    fireEvent.blur(constructionStartInput);

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
