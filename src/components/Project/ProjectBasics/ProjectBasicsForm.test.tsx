import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectBasicsForm from './ProjectBasicsForm';
import { matchExact } from '@/utils/common';
import { IPerson, IProject } from '@/interfaces/projectInterfaces';
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
  mockResponsiblePersons,
  mockResponsibleZones,
} from '@/mocks/mockLists';
import { mockHashTags } from '@/mocks/mockHashTags';
import { act } from 'react-dom/test-utils';
import { screen, waitFor } from '@testing-library/react';
import { IListItem } from '@/interfaces/common';
import mockPersons from '@/mocks/mockPersons';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectBasicsForm', () => {
  let renderResult: CustomRenderResult;

  const getFormField = (name: string) => `projectBasicsForm.${name}`;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectBasicsForm />, {
          preloadedState: {
            project: {
              projects: [mockProject.data],
              selectedProject: mockProject.data,
              count: 1,
              error: {},
              page: 1,
              updated: null,
            },
            auth: { user: mockPersons.data[0], error: {} },
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
              district: [],
              division: [],
              subDivision: [],
              responsibleZone: mockResponsibleZones.data,
              responsiblePersons: mockResponsiblePersons.data,
              error: {},
            },
            hashTags: {
              hashTags: mockHashTags.data.hashTags,
              popularHashTags: mockHashTags.data.popularHashTags,
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
    const expectPersonOption = (person: IPerson) =>
      expect(getByText(`${person.firstName} ${person.lastName}`)).toBeInTheDocument();

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
    const projectHashTags = mockHashTags.data.hashTags.filter(
      (h) => project?.hashTags?.indexOf(h.id) !== -1,
    );
    projectHashTags?.forEach((h) => {
      expect(getByText(matchExact(h.value))).toBeInTheDocument();
    });
  });

  it('has all required fields as required', () => {
    const { getByText } = renderResult;
    expect(getByText('projectBasicsForm.type')).toBeInTheDocument();
    expect(getByText('projectBasicsForm.description')).toBeInTheDocument();
  });

  it('renders hashTags modal and can search and patch hashTags', async () => {
    const { getByText, getByRole, user, getAllByTestId, store } = renderResult;
    const expectedValues = [
      ...(mockProject.data.hashTags as Array<string>),
      '816cc173-6340-45ed-9b49-4b4976b2a48b',
    ];
    const project = store.getState().project.selectedProject as IProject;
    const projectHashTags = store.getState().project.selectedProject?.hashTags;
    const projectHashTagsLength = projectHashTags?.length || 0;
    const responseProject: { data: IProject } = {
      data: { ...project, hashTags: expectedValues },
    };

    // Open modal
    await user.click(getByRole('button', { name: matchExact('projectBasicsForm.hashTags') }));

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    // Expect all elements
    expect(getByText(`${project.name} - manageHashTags`)).toBeInTheDocument();
    expect(getByText('projectHashTags')).toBeInTheDocument();
    expect(getByText('popularHashTags')).toBeInTheDocument();
    expect(getByText('addHashTagsToProject')).toBeInTheDocument();
    expect(getByText('cantFindHashTag')).toBeInTheDocument();
    expect(getByRole('button', { name: 'createNewHashTag' }));
    expect(getAllByTestId('project-hashtags').length).toBe(projectHashTagsLength);

    // Search for a hashTag and click on the search result
    await user.type(getByRole('combobox', { name: 'addHashTag' }), 'hul');
    await waitFor(async () => await user.click(getByText('hulevesi')));
    await user.click(getByRole('button', { name: matchExact('save') }));

    const hashTagsAfterSubmit = mockHashTags.data.hashTags.filter(
      (h) => expectedValues.indexOf(h.id) !== -1,
    );

    expect(hashTagsAfterSubmit.length).toBe(3);
    hashTagsAfterSubmit.forEach((h) => expect(getByText(h.value)).toBeInTheDocument());
  });

  it('can create new hashtags with the hashtags form', async () => {
    const mockPostResponse = { data: { value: 'liikenne', id: '123456789' } };
    const mockGetResponse = {
      data: {
        hashTags: [...mockHashTags.data.hashTags, mockPostResponse.data],
        popularHashTags: [],
      },
    };

    const mockPatchProjectResponse: { data: IProject } = {
      data: {
        ...mockProject.data,
        hashTags: [...(mockProject.data.hashTags as Array<string>), mockPostResponse.data.id],
      },
    };

    // Mock all needed requests, to be able to POST a hashTag, GET all hashTags
    // and PATCH the project with the newly created hashTag
    mockedAxios.post.mockResolvedValueOnce(mockPostResponse);
    mockedAxios.get.mockResolvedValueOnce(mockGetResponse);
    mockedAxios.patch.mockResolvedValueOnce(mockPatchProjectResponse);

    const { user, queryAllByText, getByTestId } = renderResult;

    // Open modal
    await user.click(getByTestId('open-hash-tag-dialog-button'));

    // Open the textbox and submit a new hashtag
    await user.click(getByTestId('create-new-hash-tag-button').children[0]);
    await user.type(getByTestId('hashTag').getElementsByTagName('input')[0], 'liikenne');
    await user.click(getByTestId('create-hash-tag-button').children[0]);

    // Click the 'add to project' button to patch the project with the new hashtag
    await user.click(getByTestId('add-new-hash-tag-to-project'));
    const formPostRequest = mockedAxios.post.mock.lastCall[1] as IListItem;

    expect(formPostRequest.value).toEqual(mockPostResponse.data.value);

    const expectedHashTags = mockGetResponse.data.hashTags.filter(
      (h) => mockProject.data.hashTags?.indexOf(h.id) !== -1,
    );
    expectedHashTags.forEach((h) => {
      return expect(queryAllByText(h.value)[0]).toBeInTheDocument();
    });
  });

  it('can use popular hashtags from the hashtags form', async () => {
    const { getByText, getByRole, user, queryByTestId, getAllByText } = renderResult;
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
    // Open modal
    await user.click(getByRole('button', { name: matchExact('projectBasicsForm.hashTags') }));

    // popular hashtag exists in the container
    expect(getByText('raidejokeri')).toBeInTheDocument();

    // Click the popular hashtag
    await user.click(getByText('raidejokeri'));

    // popular hashtag removed from the popular hashtags list

    expect(queryByTestId('popular-hashtags')).not.toHaveTextContent('raidejokeri');

    await user.click(getByRole('button', { name: matchExact('save') }));

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    const hashTagsAfterSubmit = mockHashTags.data.hashTags.filter((h) => {
      return expectedValues.indexOf(h.id) !== -1;
    });

    expect(formPatchRequest.hashTags?.length).toBe(3);
    hashTagsAfterSubmit.forEach((h) => expect(getByText(h.value)).toBeInTheDocument());

    // Open modal
    await user.click(getByRole('button', { name: matchExact('projectBasicsForm.hashTags') }));
    // Reading the whole page
    // 1 Instance in the project form & 1 Instance inside the modal under project hashtags
    expect(getAllByText('raidejokeri').length).toBe(2);
  });

  it('can autosave patch a NumberField', async () => {
    const { user, getByDisplayValue, container } = renderResult;
    const expectedValue = '1234';
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, hkrId: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

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
    const responseProject: { data: IProject } = {
      data: { ...project, area: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

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
    const responseProject: { data: IProject } = {
      data: { ...project, estPlanningStart: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

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
    const responseProject: { data: IProject } = {
      data: { ...project, description: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

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
    const responseProject: { data: IProject } = {
      data: { ...project, louhi: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const louhiField = getByTestId('louhi-0') as HTMLInputElement;
    const parentContainer = container.getElementsByClassName('basics-form')[0];

    await user.click(louhiField);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.louhi).toEqual(expectedValue);
    expect(louhiField.checked).toBe(expectedValue);
  });
});
