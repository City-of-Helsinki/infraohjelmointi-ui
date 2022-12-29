import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectBasicsForm from './ProjectBasicsForm';
import { matchExact } from '@/utils/common';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  mockConstructionPhaseDetails,
  mockConstructionPhases,
  mockPlanningPhases,
  mockProjectAreas,
  mockProjectCategories,
  mockProjectPhases,
  mockProjectQualityLevels,
  mockProjectRisks,
  mockProjectTypes,
} from '@/mocks/mockLists';
import { mockTags } from '@/mocks/common';
import { act } from 'react-dom/test-utils';
import mockUser from '@/mocks/mockUser';
import { screen } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

// These tests started taking very long after the form got fieldSets, could they maybe the optimized better?
// Currently allowing a long timeout for this test file
jest.setTimeout(40000);

describe('ProjectBasicsForm', () => {
  let renderResult: CustomRenderResult;

  const getFormField = (name: string) => `projectBasicsForm.${name}`;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectBasicsForm />, {
          preloadedState: {
            project: {
              projects: [mockProject.data as IProject],
              selectedProject: mockProject.data as IProject,
              count: 1,
              error: {},
              page: 1,
              updated: null,
            },
            auth: { user: mockUser, error: {} },
            lists: {
              area: mockProjectAreas.data,
              phase: mockProjectPhases.data,
              type: mockProjectTypes.data,
              constructionPhaseDetail: mockConstructionPhaseDetails.data,
              category: mockProjectCategories.data,
              riskAssessment: mockProjectRisks.data,
              masterClass: [],
              class: [],
              subClass: [],
              projectQualityLevel: mockProjectQualityLevels.data,
              planningPhase: mockPlanningPhases.data,
              constructionPhase: mockConstructionPhases.data,
              error: {},
            },
          },
        })),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { container } = renderResult;

    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });

  it('fills the fields with existing project  data', async () => {
    const { getByDisplayValue, getByText, getByTestId } = renderResult;
    const project = mockProject.data;
    const euroFormat = (value: string) => `${value} €`;
    const expectDisplayValue = (value: string | undefined) =>
      expect(getByDisplayValue(matchExact(value || ''))).toBeInTheDocument();
    const expectOption = (option: string | undefined) =>
      expect(getByText(`enums.${option || ''}`)).toBeInTheDocument();
    const expectRadioBoolean = (testId: string, value: boolean) =>
      expect((getByTestId(testId) as HTMLInputElement).checked).toBe(value);

    expectOption(project?.area?.value);
    expectOption(project?.type?.value);
    expectOption(project?.projectQualityLevel?.value);
    expectOption(project?.planningPhase?.value);
    expectOption(project?.constructionPhase?.value);
    expectOption(project?.constructionPhaseDetail?.value);
    expectOption(project?.category?.value);
    expectOption(project?.riskAssessment?.value);
    expectRadioBoolean('programmed-0', true);
    expectRadioBoolean('louhi-0', false);
    expectRadioBoolean('gravel-0', false);
    expectRadioBoolean('effectHousing-0', false);
    expect(getByText(euroFormat(project?.budget || ''))).toBeInTheDocument();
    expect(getByText(euroFormat(project?.realizedCost || ''))).toBeInTheDocument();
    expect(getByText(euroFormat(project?.comittedCost || ''))).toBeInTheDocument();
    expect(getByText(euroFormat(project?.spentCost || ''))).toBeInTheDocument();
    expect(getByText('overrunRightValue' || '')).toBeInTheDocument();
    expect(getByText(`${project?.budgetOverrunAmount} keur` || '')).toBeInTheDocument();
    expectDisplayValue(project?.description);
    expectDisplayValue(project?.entityName);
    expectDisplayValue(project?.hkrId);
    expectDisplayValue(project?.planningStartYear);
    expectDisplayValue(project?.constructionEndYear);
    expectDisplayValue(project?.estPlanningStart);
    expectDisplayValue(project?.estPlanningEnd);
    expectDisplayValue(project?.presenceStart);
    expectDisplayValue(project?.presenceEnd);
    expectDisplayValue(project?.visibilityStart);
    expectDisplayValue(project?.visibilityEnd);
    expectDisplayValue(project?.estConstructionStart);
    expectDisplayValue(project?.estConstructionEnd);
    expectDisplayValue(project?.projectWorkQuantity);
    expectDisplayValue(project?.projectCostForecast);
    expectDisplayValue(project?.planningCostForecast);
    expectDisplayValue(project?.planningWorkQuantity);
    expectDisplayValue(project?.constructionCostForecast);
    expectDisplayValue(project?.constructionWorkQuantity);

    expect(project?.hashTags?.length).toBe(2);
    project?.hashTags?.forEach((h) => {
      expect(getByText(matchExact(h))).toBeInTheDocument();
    });
  });

  it('has all required fields as required', () => {
    const { getByText } = renderResult;

    // Hack to check required for now... since HDS always adds the star to the input label
    expect(getByText('projectBasicsForm.type')).toBeInTheDocument();
    expect(getByText('projectBasicsForm.description')).toBeInTheDocument();
  });

  it('renders hashTags modal and can autosave patch hashTags', async () => {
    const { getByText, getByRole, user, getAllByTestId, store } = renderResult;
    const expectedValues = ['pyöräily', 'uudisrakentaminen', 'pohjoinensuurpiiri'];
    const project = store.getState().project.selectedProject as IProject;
    const projectTags = store.getState().project.selectedProject?.hashTags;
    const availableTags = mockTags.filter((tag) => projectTags?.indexOf(tag) === -1);
    const projectTagsLength = projectTags?.length || 0;
    const availableTagsLength = availableTags.length || 0;
    const responseProject: IProject = {
      ...project,
      hashTags: expectedValues,
    };

    projectTags?.forEach((t) => {
      expect(getByText(matchExact(t))).toBeInTheDocument();
    });

    // Open modal
    await user.click(getByRole('button', { name: matchExact('projectBasicsForm.hashTags') }));

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    // Expect all elements
    expect(getByText('manageHashTags')).toBeInTheDocument();
    expect(getByText('projectHashTags')).toBeInTheDocument();
    expect(getAllByTestId('project-hashtags').length).toBe(projectTagsLength);
    expect(getAllByTestId('all-hashtags').length).toBe(availableTagsLength);

    // Click on a hashtag
    await user.click(getByText('pohjoinensuurpiiri'));
    await user.click(getByRole('button', { name: matchExact('save') }));

    expectedValues.forEach((h) => expect(getByText(h)).toBeInTheDocument());
  });

  it('can autosave patch a NumberField', async () => {
    const { user, getByDisplayValue, container } = renderResult;
    const expectedValue = '1234';
    const project = mockProject.data;
    const responseProject: IProject = {
      ...project,
      hkrId: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    const parentContainer = container.getElementsByClassName('basics-form')[0];

    const hkrIdField = screen.getByRole('spinbutton', { name: getFormField('hkrId') });

    await user.clear(hkrIdField);
    await user.type(hkrIdField, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.hkrId).toEqual(expectedValue);
    expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a SelectField', async () => {
    const { user, getByRole, getByText, container } = renderResult;
    const expectedValue = { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' };
    const project = mockProject.data;
    const responseProject: IProject = {
      ...project,
      area: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.click(getByRole('button', { name: 'projectBasicsForm.area' }));
    await user.click(getByText(matchExact('enums.lansisatama')));
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.area).toEqual(expectedValue.id);
    expect(getByText(matchExact(expectedValue.value))).toBeInTheDocument();
  });

  it('can autosave patch a DateField', async () => {
    const { user, getByRole, getByDisplayValue, container } = renderResult;
    const expectedValue = '13.12.2022';
    const project = mockProject.data;
    const responseProject: IProject = {
      ...project,
      estPlanningStart: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    const parentContainer = container.getElementsByClassName('basics-form')[0];
    const estPlanningStart = getByRole('textbox', { name: getFormField('estPlanningStart') });

    await user.clear(estPlanningStart);
    await user.type(estPlanningStart, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.estPlanningStart).toEqual(expectedValue);
    expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a TextField', async () => {
    const { user, getByDisplayValue, container } = renderResult;
    const expectedValue = 'New description';
    const project = mockProject.data;
    const responseProject: IProject = {
      ...project,
      description: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    const descriptionField = screen.getByRole('textbox', { name: getFormField('description *') });
    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.clear(descriptionField);
    await user.type(descriptionField, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.description).toEqual(expectedValue);
    expect(getByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a RadioCheckboxField', async () => {
    const { user, container, getByTestId } = renderResult;
    const expectedValue = true;
    const project = mockProject.data;
    const responseProject: IProject = {
      ...project,
      louhi: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    const louhiField = getByTestId('louhi-0') as HTMLInputElement;
    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.click(louhiField);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.louhi).toEqual(expectedValue);
    expect(louhiField.checked).toBe(expectedValue);
  });
});
