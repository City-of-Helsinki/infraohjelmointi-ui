import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { renderWithProviders, sendProjectUpdateEvent } from '@/utils/testUtils';
import { arrayHasValue, formatNumberToContainSpaces, matchExact } from '@/utils/common';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  mockBudgetOverrunReasons,
  mockConstructionPhaseDetails,
  mockConstructionProcurementMethods,
  mockConstructionPhases,
  mockPlanningPhases,
  mockProjectAreas,
  mockProjectCategories,
  mockProjectPhases,
  mockProjectQualityLevels,
  mockProjectRisks,
  mockProjectTypes,
  mockResponsiblePersons,
  mockResponsibleZones,
  mockProgrammers,
} from '@/mocks/mockLists';
import { mockHashTags } from '@/mocks/mockHashTags';
import { addProjectUpdateEventListener, removeProjectUpdateEventListener } from '@/utils/events';
import { waitFor, act, within, screen } from '@testing-library/react';
import { Route } from 'react-router';
import { resetProject, setProjectMode, setSelectedProject } from '@/reducers/projectSlice';
import { Dispatch } from '@reduxjs/toolkit';
import ProjectForm from './ProjectForm';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import ProjectView from '@/views/ProjectView';
import ProjectBasics from '../ProjectBasics';
import PlanningView from '@/views/PlanningView/PlanningView';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ConfirmDialogContextProvider from '@/components/context/ConfirmDialogContext';
import { mockUser } from '@/mocks/mockUsers';
import { IPerson } from '@/interfaces/personsInterfaces';
import { mockAllSapCostsProject, mockCurrentYearSapCostsProject } from '@/mocks/mockSapCosts';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());
jest.setTimeout(15000);

const mockedAxios = axios as jest.Mocked<typeof axios>;

const getFormField = (name: string) => `projectForm.${name}`;

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route>
        <Route
          path="/"
          element={
            <ConfirmDialogContextProvider>
              <ProjectForm />
              <ConfirmDialog />
            </ConfirmDialogContextProvider>
          }
        />
        <Route path="/project/:projectId?" element={<ProjectView />}>
          <Route path="basics" element={<ProjectBasics />} />
        </Route>
        <Route path="/planning" element={<PlanningView />} />
      </Route>,

      {
        preloadedState: {
          project: {
            selectedProject: mockProject.data,
            count: 1,
            error: {},
            page: 1,
            isSaving: false,
            mode: 'edit',
          },
          auth: { user: mockUser.data, error: {} },
          lists: {
            areas: mockProjectAreas.data,
            phases: mockProjectPhases.data,
            types: mockProjectTypes.data,
            constructionPhaseDetails: mockConstructionPhaseDetails.data,
            constructionProcurementMethods: mockConstructionProcurementMethods.data,
            categories: mockProjectCategories.data,
            riskAssessments: mockProjectRisks.data,
            projectQualityLevels: mockProjectQualityLevels.data,
            planningPhases: mockPlanningPhases.data,
            constructionPhases: mockConstructionPhases.data,
            responsibleZones: mockResponsibleZones.data,
            responsiblePersons: mockResponsiblePersons.data,
            responsiblePersonsRaw: [],
            programmedYears: [],
            projectDistricts: [],
            projectDivisions: [],
            projectSubDivisions: [],
            budgetOverrunReasons: mockBudgetOverrunReasons.data,
            programmers: mockProgrammers.data,
            projectClasses: [],
            talpaProjectRanges: [],
            talpaProjectTypes: [],
            talpaServiceClasses: [],
            talpaAssetClasses: [],
            error: {},
          },
          hashTags: {
            hashTags: mockHashTags.data.hashTags,
            popularHashTags: mockHashTags.data.popularHashTags,
            error: {},
          },
          sapCosts: {
            projects: mockAllSapCostsProject.data,
            currentYearSapProjects: mockCurrentYearSapCostsProject.data,
            groups: {},
            currentYearSapGroups: {},
            error: null,
          },
        },
      },
    ),
  );

/**
 * simulate event and setting selected project since it happens in projectview
 */
const sendProjectUpdateEventAndUpdateRedux = async (dispatch: Dispatch, project: IProject) => {
  try {
    await sendProjectUpdateEvent(project);
    dispatch(setSelectedProject(project));
  } catch (e) {
    console.log('Error setting project update event listener: ', e);
  }
};

describe('projectForm', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { findByTestId } = await render();

    expect(await findByTestId('project-form')).toBeInTheDocument();
  });

  it('fills the fields with existing project data', async () => {
    const { findByDisplayValue, findByText, findAllByText, findByTestId } = await render();

    const project = mockProject.data;
    const sapCostAll = mockAllSapCostsProject.data;
    const sapCostCurrentYear = project.currentYearsSapValues
      ? project.currentYearsSapValues[0]
      : null;
    const expectDisplayValue = async (value: string | undefined | null) =>
      expect(await findByDisplayValue(value || '')).toBeInTheDocument();
    const expectOption = async (option: string | undefined) =>
      expect((await findAllByText(new RegExp(option || '', 'i')))[0]).toBeInTheDocument();
    const expectRadioBoolean = async (testId: string, value: boolean) =>
      expect(((await findByTestId(testId)) as HTMLInputElement).checked).toBe(value);
    const expectPersonOption = async (person: IPerson) =>
      expect(await findByText(`${person.firstName} ${person.lastName}`)).toBeInTheDocument();

    expectOption(project?.area?.value);
    expectOption(project?.type?.value);
    expectOption(project?.projectQualityLevel?.value);
    expectOption(project?.planningPhase?.value);
    expectOption(project?.constructionPhase?.value);
    expectOption(project?.constructionPhaseDetail?.value);
    expectOption(project?.category?.value);
    expectOption(project?.riskAssessment?.value);
    expectPersonOption(project?.personPlanning as IPerson);
    expectPersonOption(project?.personConstruction as IPerson);
    expectPersonOption(project?.personProgramming as IPerson);
    expectRadioBoolean('programmed-0', true);
    expectRadioBoolean('louhi-0', false);
    expectRadioBoolean('gravel-0', false);
    expectRadioBoolean('effectHousing-0', false);

    const costForecastValue = Number(project?.costForecast).toFixed(0);
    expect(
      await findByText(`${formatNumberToContainSpaces(Number(costForecastValue))}`),
    ).toBeInTheDocument();

    const sapCurrentYearprojectTaskCosts = Number(sapCostCurrentYear?.project_task_costs).toFixed(
      0,
    );
    const sapCurrentYearProductionTaskCosts = Number(
      sapCostCurrentYear?.production_task_costs,
    ).toFixed(0);
    const sapCostsCurrentYearValue =
      Number(sapCurrentYearprojectTaskCosts) + Number(sapCurrentYearProductionTaskCosts);
    expect(
      await findByText(`${formatNumberToContainSpaces(sapCostsCurrentYearValue)}`),
    ).toBeInTheDocument();

    const sapAllProjectTaskCosts = Number(sapCostAll[project.id]?.project_task_costs).toFixed(0);
    const sapAllProductionTaskCosts = Number(sapCostAll[project.id]?.production_task_costs).toFixed(
      0,
    );
    const sapCostsAllValue = Number(sapAllProjectTaskCosts) + Number(sapAllProductionTaskCosts);
    expect(
      await findByText(`${formatNumberToContainSpaces(sapCostsAllValue)}`),
    ).toBeInTheDocument();

    const sapAllProjectTaskCommitments = Number(
      sapCostAll[project.id]?.project_task_commitments,
    ).toFixed(0);
    const sapAllProductionTaskCommitments = Number(
      sapCostAll[project.id]?.production_task_commitments,
    ).toFixed(0);
    const sapCommitmentsAllValue =
      Number(sapAllProjectTaskCommitments) + Number(sapAllProductionTaskCommitments);
    expect(
      await findByText(`${formatNumberToContainSpaces(sapCommitmentsAllValue)}`),
    ).toBeInTheDocument();

    const SapAllSpentValue = sapCostsAllValue + sapCommitmentsAllValue;
    expect(
      await findByText(`${formatNumberToContainSpaces(SapAllSpentValue)}`),
    ).toBeInTheDocument();

    expectDisplayValue(project?.description);
    expectDisplayValue(project?.entityName);
    expectDisplayValue(project?.hkrId);
    expectDisplayValue(project?.planningStartYear?.toString());
    expectDisplayValue(project?.constructionEndYear?.toString());
    expectDisplayValue(project?.estPlanningStart || '');
    expectDisplayValue(project?.estPlanningEnd || '');
    expectDisplayValue(project?.presenceStart);
    expectDisplayValue(project?.presenceEnd);
    expectDisplayValue(project?.visibilityStart);
    expectDisplayValue(project?.visibilityEnd);
    expectDisplayValue(project?.estConstructionStart || '');
    expectDisplayValue(project?.estConstructionEnd || '');
    expectDisplayValue(project?.projectWorkQuantity);
    expectDisplayValue(project?.projectCostForecast);
    expectDisplayValue(project?.planningCostForecast);
    expectDisplayValue(project?.planningWorkQuantity);
    expectDisplayValue(project?.constructionCostForecast);
    expectDisplayValue(project?.constructionWorkQuantity);

    expect(project?.hashTags?.length).toBe(2);

    const projectHashTags = mockHashTags.data.hashTags.filter((h) =>
      arrayHasValue(project?.hashTags, h.id),
    );

    projectHashTags?.forEach(async (h) => {
      expect(await findByText(matchExact(h.value))).toBeInTheDocument();
    });
  });

  it('renders hashTags modal and can search and patch hashTags', async () => {
    const { findByText, findByRole, user, store, findByTestId } = await render();

    addProjectUpdateEventListener(store.dispatch);

    const expectedValues = [...(mockProject.data.hashTags as Array<string>), 'hashtag-3'];

    const project = store.getState().project.selectedProject as IProject;
    const responseProject: { data: IProject } = {
      data: { ...project, hashTags: expectedValues },
    };

    // Open modal
    await user.click(await findByTestId('open-hash-tag-dialog-button'));
    const dialog = within(await findByRole('dialog'));

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    // Expect all elements
    expect(await dialog.findByText(`${project.name} - manageHashTags`)).toBeInTheDocument();
    expect(await dialog.findByText('projectHashTags')).toBeInTheDocument();
    expect(await dialog.findByText('popularHashTags')).toBeInTheDocument();
    expect(await dialog.findByText('addHashTagsToProject')).toBeInTheDocument();

    expect((await dialog.findAllByTestId('project-hashtags')).length).toBe(2);

    // Search for a hashTag and click on the search result
    await user.type(await dialog.findByRole('combobox', { name: 'addHashTag' }), 'hul');

    await waitFor(async () => await user.click(await dialog.findByText('hulevesi')));

    await user.click(await dialog.findByRole('button', { name: matchExact('save') }));

    await act(async () => {
      sendProjectUpdateEventAndUpdateRedux(store.dispatch, responseProject.data);
    });

    await waitFor(() => expect(dialog).not.toBeInTheDocument);

    const hashTagsAfterSubmit = mockHashTags.data.hashTags.filter((h) =>
      arrayHasValue(expectedValues, h.id),
    );

    expect(hashTagsAfterSubmit.length).toBe(3);
    expect(await findByText('leikkipaikka')).toBeInTheDocument();
    expect(await findByText('leikkipuisto')).toBeInTheDocument();
    expect(await findByText('hulevesi')).toBeInTheDocument();

    removeProjectUpdateEventListener(store.dispatch);
  });

  it('can use popular hashtags from the hashtags form', async () => {
    const expectedValues = [
      ...(mockProject.data.hashTags as Array<string>),
      mockHashTags.data.popularHashTags[0].id,
    ];
    const mockPatchProjectResponse: { data: IProject } = {
      data: { ...mockProject.data, hashTags: expectedValues },
    };

    // Mock all needed requests, to be able to
    // PATCH the project with the popular hashtag
    mockedAxios.patch.mockResolvedValueOnce(mockPatchProjectResponse);
    const {
      findByText,
      findByRole,
      findByTestId,
      user,
      store: { dispatch },
    } = await render();

    addProjectUpdateEventListener(dispatch);

    // Open modal
    await user.click(await findByTestId('open-hash-tag-dialog-button'));
    const dialog = within(await findByRole('dialog'));

    // popular hashtag exists in the container
    const raidejokeriHashTag = await dialog.findByText('raidejokeri');
    expect(raidejokeriHashTag).toBeInTheDocument();

    // Click the popular hashtag
    await user.click(raidejokeriHashTag);
    expect(dialog.queryByTestId('popular-hashtags')).not.toHaveTextContent('raidejokeri');

    await waitFor(
      async () =>
        await user.click((await dialog.findByTestId('save-hash-tags-to-project')).children[0]),
    );

    // simulate event and setting selected project since it happens in projectview
    await act(() => sendProjectUpdateEventAndUpdateRedux(dispatch, mockPatchProjectResponse.data));

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    const hashTagsAfterSubmit = mockHashTags.data.hashTags.filter((h) =>
      arrayHasValue(expectedValues, h.id),
    );
    expect(formPatchRequest.hashTags?.length).toBe(3);
    expect(hashTagsAfterSubmit.length).toBe(3);
    expect(await findByText('leikkipaikka')).toBeInTheDocument();
    expect(await findByText('leikkipuisto')).toBeInTheDocument();
    expect(await findByText('raidejokeri')).toBeInTheDocument();

    removeProjectUpdateEventListener(dispatch);
  });

  it('can patch a NumberField', async () => {
    const project = mockProject.data;
    const expectedValue = '1234';
    const responseProject: { data: IProject } = {
      data: { ...project, hkrId: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByDisplayValue, findByTestId, findByRole } = await render();

    const formSubmitButton = await findByTestId('submit-project-button');

    const hkrIdField = await findByRole('spinbutton', { name: getFormField('hkrId') });

    await user.clear(hkrIdField);
    await user.type(hkrIdField, expectedValue);
    await user.click(formSubmitButton);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.hkrId).toEqual(expectedValue);
    expect(await findByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can patch a SelectField', async () => {
    const expectedValue = { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' };
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, area: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByText, findByTestId } = await render();

    const formSubmitButton = await findByTestId('submit-project-button');

    await user.click(screen.getByRole('combobox', { name: /area/i }));
    await user.click(await findByText('option.lansisatama'));
    await user.click(formSubmitButton);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.area).toEqual(expectedValue.id);
    expect(await findByText(matchExact(expectedValue.value))).toBeInTheDocument();
  });

  it('can patch a DateField when year doesnt differ from planningStartYear', async () => {
    const { user, findByRole, findByDisplayValue, findByTestId } = await render();
    const expectedValue = '13.12.2020';
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, estPlanningStart: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const formSubmitButton = await findByTestId('submit-project-button');
    const estPlanningStart = await findByRole('textbox', {
      name: getFormField('estPlanningStart'),
    });

    await user.clear(estPlanningStart);
    await user.type(estPlanningStart, expectedValue);
    await user.click(formSubmitButton);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.estPlanningStart).toEqual(expectedValue);
    expect(await findByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can not patch a DateField when year of date differs from planningStartYear', async () => {
    const { user, findByRole, findByTestId } = await render();
    const expectedValue = '13.12.2021';
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, estPlanningStart: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const formSubmitButton = await findByTestId('submit-project-button');
    const estPlanningStart = await findByRole('textbox', {
      name: getFormField('estPlanningStart'),
    });
    const planningStartYear = await findByRole('spinbutton', {
      name: getFormField('planningStartYear'),
    });

    await user.clear(estPlanningStart);
    await user.type(estPlanningStart, expectedValue);
    await user.click(formSubmitButton);

    const yearToBeSet = expectedValue.split('.')[2];

    expect(planningStartYear).not.toEqual(yearToBeSet);
    expect(mockedAxios.patch.mock.lastCall).toBeUndefined();
  });

  it('can patch a TextField', async () => {
    const expectedValue = 'New description';
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, description: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByDisplayValue, findByTestId, findByRole } = await render();

    const descriptionField = await findByRole('textbox', { name: getFormField('description *') });
    const formSubmitButton = await findByTestId('submit-project-button');

    await user.clear(descriptionField);
    await user.type(descriptionField, expectedValue);
    await user.click(formSubmitButton);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.description).toEqual(expectedValue);
    expect(await findByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can patch a RadioCheckboxField', async () => {
    const expectedValue = true;
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, louhi: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByTestId } = await render();

    const louhiField = (await findByTestId('louhi-0')) as HTMLInputElement;
    const formSubmitButton = await findByTestId('submit-project-button');

    await user.click(louhiField);
    await user.click(formSubmitButton);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;

    expect(formPatchRequest.louhi).toEqual(expectedValue);
    expect(louhiField.checked).toBe(expectedValue);
  });

  it('can post a new project', async () => {
    const { user, findByDisplayValue, findByTestId, findByRole, store } = await render();
    const { dispatch } = store;

    const expectedName = 'Post project';
    const expectedDescription = 'Post project description';
    const expectedProgrammed = false;
    const expectedPhase = {
      id: '7bc0829e-ffb4-4e4c-8653-1e1709e9f17a',
      value: 'proposal',
    };

    const project = mockProject.data;
    const mockPostResponse: { data: IProject; status: number } = {
      data: {
        ...project,
        id: 'post-project-id',
        description: expectedDescription,
        programmed: expectedProgrammed,
        phase: expectedPhase,
        name: expectedName,
      },
      status: 201,
    };

    // reset the form and set project mode to new
    await waitFor(() => {
      store.dispatch(resetProject());
      store.dispatch(setProjectMode('new'));
    });
    expect(store.getState().project.selectedProject).toBe(null);
    expect(store.getState().project.mode).toBe('new');

    mockedAxios.post.mockResolvedValueOnce(mockPostResponse);

    const parentContainer = await findByTestId('project-form');
    const nameField = await findByRole('textbox', { name: getFormField('name *') });
    const descriptionField = await findByRole('textbox', { name: getFormField('description *') });

    // write name and description
    await user.type(nameField, expectedName);
    await user.type(descriptionField, expectedDescription);
    expect((nameField as HTMLInputElement).value.length).toBeGreaterThan(0);
    expect((descriptionField as HTMLInputElement).value.length).toBeGreaterThan(0);

    // select phase
    await user.click(screen.getAllByRole('combobox', { name: /phase/i })[0]);
    await user.click(await within(parentContainer).findByText('option.proposal'));

    // save project
    const submitProjectButton = await findByTestId('submit-project-button');
    mockedAxios.get.mockResolvedValueOnce(mockPostResponse);
    await waitFor(async () => {
      await user.click(submitProjectButton);
      dispatch(setSelectedProject(mockPostResponse.data));
      store.dispatch(setProjectMode('edit'));
    });

    // Ensure that mode is edit and store contains the saved project
    expect(store.getState().project.mode).toBe('edit');
    expect(store.getState().project.selectedProject).toBe(mockPostResponse.data);
    expect(await findByTestId('open-delete-project-dialog-button')).toBeInTheDocument();

    // Ensure that correct values are present on the form
    expect(await findByDisplayValue(matchExact(expectedName))).toBeInTheDocument();
    expect(await findByTestId('project-form-description')).toHaveTextContent(
      matchExact(expectedDescription),
    );
    expect(await findByTestId('phase')).toHaveTextContent(matchExact(expectedPhase.value));
  }, 15000);

  it('can patch a project', async () => {
    const expectedDescription = 'Patched project description';
    const expectedHkrId = null;
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, description: expectedDescription, hkrId: expectedHkrId },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByDisplayValue, findByTestId, findByRole } = await render();

    const descriptionField = await findByRole('textbox', { name: getFormField('description *') });
    const hkrIdField = await findByRole('spinbutton', { name: getFormField('hkrId') });
    const formSubmitButton = await findByTestId('submit-project-button');

    await user.clear(descriptionField);
    await user.type(descriptionField, expectedDescription);
    await user.clear(hkrIdField);

    await user.click(formSubmitButton);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.description).toEqual(expectedDescription);
    expect(formPatchRequest.hkrId).toEqual(expectedHkrId);
    expect(await findByDisplayValue(matchExact(expectedDescription))).toBeInTheDocument();
  });

  it('can delete a project', async () => {
    const project = mockProject.data;
    const deleteResponse = { data: { id: project.id } };
    mockedAxios.delete.mockResolvedValueOnce(deleteResponse);
    const { user, findByTestId, findByRole } = await render();

    const openDeleteDialogButton = await findByTestId('open-delete-project-dialog-button');
    await user.click(openDeleteDialogButton);

    const dialog = within(await findByRole('dialog'));
    const deleteProjectButton = await dialog.findByTestId(`confirm-dialog-button`);
    expect(deleteProjectButton).toBeInTheDocument();
    await user.click(deleteProjectButton);

    expect(mockedAxios.delete).toHaveBeenCalledWith('localhost:4000/projects/mock-project-id/');
  });

  describe('budget overrun reason selection', () => {
    it('selecting budget overrun reason to otherReason enables otherBudgetOverrunReason field', async () => {
      const { user } = await render();

      const otherBudgetOverrunReasonField = await screen.findByRole('textbox', {
        name: getFormField('otherBudgetOverrunReason'),
      });

      expect(otherBudgetOverrunReasonField).toBeDisabled();

      await user.click(
        await screen.findByRole('combobox', {
          name: /budgetOverrunReason/i,
        }),
      );
      await user.click(await screen.findByText('option.otherReason'));

      expect(otherBudgetOverrunReasonField).toBeEnabled();
    });

    it('selecting budget overrun reason other than otherReason disables and clears otherBudgetOverrunReason field', async () => {
      const { user } = await render();

      const otherBudgetOverrunReasonField = await screen.findByRole('textbox', {
        name: getFormField('otherBudgetOverrunReason'),
      });
      const budgetOverrunReasonSelect = await screen.findByRole('combobox', {
        name: /budgetOverrunReason/i,
      });

      await user.click(budgetOverrunReasonSelect);
      await user.click(await screen.findByText('option.otherReason'));

      await user.type(otherBudgetOverrunReasonField, 'Some reason');
      expect(otherBudgetOverrunReasonField).toHaveValue('Some reason');

      await user.click(budgetOverrunReasonSelect);
      await user.click(await screen.findByText('option.earlierSchedule'));

      expect(otherBudgetOverrunReasonField).toBeDisabled();
      expect(otherBudgetOverrunReasonField).toHaveValue('');
    });

    it('shows onSchedule field when otherReason is selected', async () => {
      const { user } = await render();

      expect(screen.queryByText(getFormField('onSchedule'))).not.toBeInTheDocument();

      await user.click(
        await screen.findByRole('combobox', {
          name: /budgetOverrunReason/i,
        }),
      );
      await user.click(await screen.findByText('option.otherReason'));

      expect(screen.queryByText(getFormField('onSchedule'))).toBeInTheDocument();
    });
  });
});
