import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectBasicsForm from './ProjectBasicsForm';
import { arrayHasValue, matchExact } from '@/utils/common';
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

import { waitFor, act, within } from '@testing-library/react';
import { IListItem } from '@/interfaces/common';
import mockPersons from '@/mocks/mockPersons';
import { Route } from 'react-router';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const getFormField = (name: string) => `projectBasicsForm.${name}`;

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<ProjectBasicsForm />} />, {
      preloadedState: {
        project: {
          selectedProject: mockProject.data,
          count: 1,
          error: {},
          page: 1,
          updated: null,
        },
        auth: { user: mockPersons.data[0], error: {} },
        lists: {
          areas: mockProjectAreas.data,
          phases: mockProjectPhases.data,
          types: mockProjectTypes.data,
          constructionPhaseDetails: mockConstructionPhaseDetails.data,
          categories: mockProjectCategories.data,
          riskAssessments: mockProjectRisks.data,
          projectQualityLevels: mockProjectQualityLevels.data,
          planningPhases: mockPlanningPhases.data,
          constructionPhases: mockConstructionPhases.data,
          responsibleZones: mockResponsibleZones.data,
          responsiblePersons: mockResponsiblePersons.data,
          programmedYears: [],
          error: {},
        },
        hashTags: {
          hashTags: mockHashTags.data.hashTags,
          popularHashTags: mockHashTags.data.popularHashTags,
          error: {},
        },
      },
    }),
  );

describe('ProjectBasicsForm', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { findByTestId } = await render();

    expect(await findByTestId('project-basics-form')).toBeInTheDocument();
  });

  it('fills the fields with existing project data', async () => {
    const { findByDisplayValue, findByText, findByTestId } = await render();

    const project = mockProject.data;
    const euroFormat = (value: string) => `${value} €`;
    const expectDisplayValue = async (value: string | undefined) =>
      expect(await findByDisplayValue(matchExact(value || ''))).toBeInTheDocument();
    const expectOption = async (option: string | undefined) =>
      expect(await findByText(`enums.${option || ''}`)).toBeInTheDocument();
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
    expect(await findByText(euroFormat(project?.budget || ''))).toBeInTheDocument();
    expect(await findByText(euroFormat(project?.realizedCost || ''))).toBeInTheDocument();
    expect(await findByText(euroFormat(project?.comittedCost || ''))).toBeInTheDocument();
    expect(await findByText(euroFormat(project?.spentCost || ''))).toBeInTheDocument();
    expect(await findByText('overrunRightValue' || '')).toBeInTheDocument();
    expect(await findByText(`${project?.budgetOverrunAmount} keur` || '')).toBeInTheDocument();
    expectDisplayValue(project?.description);
    expectDisplayValue(project?.entityName);
    expectDisplayValue(project?.hkrId);
    expectDisplayValue(project?.planningStartYear);
    expectDisplayValue(project?.constructionEndYear);
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

    expect(project?.hashTags?.length).toBe(8);
    const projectHashTags = mockHashTags.data.hashTags.filter((h) =>
      arrayHasValue(project?.hashTags, h.id),
    );
    projectHashTags?.forEach(async (h) => {
      expect(await findByText(matchExact(h.value))).toBeInTheDocument();
    });
  });

  it('has all required fields as required', async () => {
    const { findByText } = await render();

    expect(await findByText('projectBasicsForm.type')).toBeInTheDocument();
    expect(await findByText('projectBasicsForm.description')).toBeInTheDocument();
  });

  it('renders hashTags modal and can search and patch hashTags', async () => {
    const { findByText, findByRole, user, store } = await render();

    const expectedValues = [
      ...(mockProject.data.hashTags as Array<string>),
      '816cc173-6340-45ed-9b49-4b4976b2a48b',
    ];
    const project = store.getState().project.selectedProject as IProject;
    const responseProject: { data: IProject } = {
      data: { ...project, hashTags: expectedValues },
    };

    // Open modal
    await user.click(await findByRole('button', { name: 'projectBasicsForm.hashTags' }));
    const dialog = within(await findByRole('dialog'));

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    // Expect all elements
    expect(await dialog.findByText(`${project.name} - manageHashTags`)).toBeInTheDocument();
    expect(await dialog.findByText('projectHashTags')).toBeInTheDocument();
    expect(await dialog.findByText('popularHashTags')).toBeInTheDocument();
    expect(await dialog.findByText('addHashTagsToProject')).toBeInTheDocument();
    expect(await dialog.findByText('cantFindHashTag')).toBeInTheDocument();

    expect(await dialog.findByRole('button', { name: 'createNewHashTag' }));
    expect((await dialog.findAllByTestId('project-hashtags')).length).toBe(2);

    // Search for a hashTag and click on the search result
    await user.type(await dialog.findByRole('combobox', { name: 'addHashTag' }), 'hul');

    await waitFor(async () => await user.click(await dialog.findByText('hulevesi')));

    await user.click(await dialog.findByRole('button', { name: matchExact('save') }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument);

    const hashTagsAfterSubmit = mockHashTags.data.hashTags.filter((h) =>
      arrayHasValue(expectedValues, h.id),
    );

    expect(hashTagsAfterSubmit.length).toBe(3);
    expect(await findByText('leikkipaikka')).toBeInTheDocument();
    expect(await findByText('leikkipuisto')).toBeInTheDocument();
    expect(await findByText('hulevesi')).toBeInTheDocument();
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
    // after closing dialog
    mockedAxios.get.mockResolvedValueOnce(mockPatchProjectResponse);

    const { user, findByText, findByRole } = await render();

    // Open modal
    await user.click(await findByRole('button', { name: 'projectBasicsForm.hashTags' }));
    const dialog = within(await findByRole('dialog'));

    // Open the textbox and submit a new hashtag
    await user.click((await dialog.findByTestId('create-new-hash-tag-button')).children[0]);
    await user.type(
      (await dialog.findByTestId('hashTag')).getElementsByTagName('input')[0],
      'liikenne',
    );
    await user.click((await dialog.findByTestId('create-hash-tag-button')).children[0]);

    // Click the 'add to project' button to patch the project with the new hashtag
    await user.click(await dialog.findByTestId('add-new-hash-tag-to-project'));

    await waitFor(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(dialog).not.toBeInTheDocument;
    });

    const formPostRequest = mockedAxios.post.mock.lastCall[1] as IListItem;

    expect(formPostRequest.value).toEqual(mockPostResponse.data.value);

    const expectedHashTags = mockGetResponse.data.hashTags.filter((h) =>
      arrayHasValue(mockProject.data.hashTags, h.id),
    );
    expect(expectedHashTags.length).toBe(2);
    expect(await findByText('leikkipaikka')).toBeInTheDocument();
    expect(await findByText('leikkipuisto')).toBeInTheDocument();
    expect(await findByText('liikenne')).toBeInTheDocument();
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
    const { findByText, findByRole, user } = await render();

    // Open modal
    await user.click(await findByRole('button', { name: 'projectBasicsForm.hashTags' }));
    const dialog = within(await findByRole('dialog'));

    // popular hashtag exists in the container
    const raidejokeriHashTag = await dialog.findByText('raidejokeri');
    expect(raidejokeriHashTag).toBeInTheDocument();

    // Click the popular hashtag
    await user.click(raidejokeriHashTag);
    expect(dialog.queryByTestId('popular-hashtags')).not.toHaveTextContent('raidejokeri');

    await waitFor(
      async () => await user.click(await dialog.findByRole('button', { name: 'save' })),
    );

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    const hashTagsAfterSubmit = mockHashTags.data.hashTags.filter((h) =>
      arrayHasValue(expectedValues, h.id),
    );
    expect(formPatchRequest.hashTags?.length).toBe(3);
    expect(hashTagsAfterSubmit.length).toBe(3);
    expect(await findByText('leikkipaikka')).toBeInTheDocument();
    expect(await findByText('leikkipuisto')).toBeInTheDocument();
    expect(await findByText('raidejokeri')).toBeInTheDocument();
  });

  it('can autosave patch a NumberField', async () => {
    const project = mockProject.data;
    const expectedValue = '1234';
    const responseProject: { data: IProject } = {
      data: { ...project, hkrId: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByDisplayValue, findByTestId, findByRole } = await render();

    const parentContainer = await findByTestId('project-basics-form');

    const hkrIdField = await findByRole('spinbutton', { name: getFormField('hkrId') });

    await user.clear(hkrIdField);
    await user.type(hkrIdField, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.hkrId).toEqual(expectedValue);
    expect(await findByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a SelectField', async () => {
    const expectedValue = { id: '35279d39-1b70-4cb7-a360-a43cd45d7b5c', value: 'lansisatama' };
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, area: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByRole, findByText, findByTestId } = await render();

    const parentContainer = await findByTestId('project-basics-form');

    await user.click(await findByRole('button', { name: 'projectBasicsForm.area' }));
    await user.click(await findByText(matchExact('enums.lansisatama')));
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.area).toEqual(expectedValue.id);
    expect(await findByText(matchExact(expectedValue.value))).toBeInTheDocument();
  });

  it('can autosave patch a DateField', async () => {
    const { user, findByRole, findByDisplayValue, findByTestId } = await render();
    const expectedValue = '13.12.2022';
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, estPlanningStart: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const parentContainer = await findByTestId('project-basics-form');
    const estPlanningStart = await findByRole('textbox', {
      name: getFormField('estPlanningStart'),
    });

    await user.clear(estPlanningStart);
    await user.type(estPlanningStart, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.estPlanningStart).toEqual(expectedValue);
    expect(await findByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a TextField', async () => {
    const expectedValue = 'New description';
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, description: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByDisplayValue, findByTestId, findByRole } = await render();

    const descriptionField = await findByRole('textbox', { name: getFormField('description *') });
    const parentContainer = await findByTestId('project-basics-form');

    await user.clear(descriptionField);
    await user.type(descriptionField, expectedValue);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.description).toEqual(expectedValue);
    expect(await findByDisplayValue(matchExact(expectedValue))).toBeInTheDocument();
  });

  it('can autosave patch a RadioCheckboxField', async () => {
    const expectedValue = true;
    const project = mockProject.data;
    const responseProject: { data: IProject } = {
      data: { ...project, louhi: expectedValue },
    };

    mockedAxios.patch.mockResolvedValueOnce(responseProject);

    const { user, findByTestId } = await render();

    const louhiField = (await findByTestId('louhi-0')) as HTMLInputElement;
    const parentContainer = await findByTestId('project-basics-form');

    await user.click(louhiField);
    await user.click(parentContainer);

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;

    expect(formPatchRequest.louhi).toEqual(expectedValue);
    expect(louhiField.checked).toBe(expectedValue);
  });
});
