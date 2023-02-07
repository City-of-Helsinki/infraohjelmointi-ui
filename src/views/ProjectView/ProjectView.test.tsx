import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import ProjectView from './ProjectView';
import { getProjectThunk } from '@/reducers/projectSlice';
import { getHashTagsThunk } from '@/reducers/hashTagsSlice';
import { mockHashTags } from '@/mocks/mockHashTags';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';
import mockProjectClasses from '@/mocks/mockClasses';
import { getClassesThunk } from '@/reducers/classSlice';
import { mockLocations } from '@/mocks/mockLocations';
import { getLocationsThunk } from '@/reducers/locationSlice';
import { act } from 'react-dom/test-utils';
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
import {
  getConstructionPhaseDetailsThunk,
  getConstructionPhasesThunk,
  getResponsiblePersonsThunk,
  getPlanningPhasesThunk,
  getProjectAreasThunk,
  getProjectCategoriesThunk,
  getProjectPhasesThunk,
  getProjectQualityLevelsThunk,
  getProjectRisksThunk,
  getProjectTypesThunk,
  getResponsibleZonesThunk,
} from '@/reducers/listsSlice';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectView', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    mockGetResponseProvider();
    await act(async () => (renderResult = renderWithProviders(<ProjectView />)));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    const { store } = renderResult;

    const lists = store.getState().lists;
    const classes = store.getState().class;
    const locations = store.getState().location;
    const hashTags = store.getState().hashTags;

    expect(store.getState().project.selectedProject).toStrictEqual(mockProject.data);
    expect(hashTags.hashTags).toStrictEqual(mockHashTags.data.hashTags);
    expect(hashTags.popularHashTags).toStrictEqual(mockHashTags.data.popularHashTags);
    expect(lists.area).toStrictEqual(mockProjectAreas.data);
    expect(lists.type).toStrictEqual(mockProjectTypes.data);
    expect(lists.phase).toStrictEqual(mockProjectPhases.data);
    expect(lists.category).toStrictEqual(mockProjectCategories.data);
    expect(lists.constructionPhaseDetail).toStrictEqual(mockConstructionPhaseDetails.data);
    expect(lists.riskAssessment).toStrictEqual(mockProjectRisks.data);
    expect(lists.projectQualityLevel).toStrictEqual(mockProjectQualityLevels.data);
    expect(lists.constructionPhase).toStrictEqual(mockConstructionPhases.data);
    expect(lists.planningPhase).toStrictEqual(mockPlanningPhases.data);
    expect(lists.responsibleZone).toStrictEqual(mockResponsibleZones.data);
    expect(lists.responsiblePersons).toStrictEqual(mockResponsiblePersons.data);
    expect(classes.allClasses).toStrictEqual(mockProjectClasses.data);
    expect(classes.masterClasses.length).toBeGreaterThan(0);
    expect(classes.classes.length).toBeGreaterThan(0);
    expect(classes.subClasses.length).toBeGreaterThan(0);
    expect(locations.allLocations).toStrictEqual(mockLocations.data);
    expect(locations.districts.length).toBeGreaterThan(0);
    expect(locations.divisions.length).toBeGreaterThan(0);
    expect(locations.subDivisions.length).toBeGreaterThan(0);
  });

  it('renders the parent container', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-container').length).toBe(1);
  });

  it('renders the ProjectToolbar', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('toolbar-container').length).toBe(1);
  });

  it('renders the ProjectHeader', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-header-container').length).toBe(1);
  });

  it('renders the ProjectTabs', async () => {
    const { findByTestId } = renderResult;
    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });

  it('catches a failed project  fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectThunk(mockProject.data.id));

    const storeError = store.getState().project.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed phase list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectPhasesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed type list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectTypesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed area list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectAreasThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed constructionPhaseDetails list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getConstructionPhaseDetailsThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectCategories list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectCategoriesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectRisks list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectRisksThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectQualityLevel list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectQualityLevelsThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed planningPhase list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getPlanningPhasesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed constructionPhase list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getConstructionPhasesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed classes fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getClassesThunk());

    const storeError = store.getState().class.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed locations fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getLocationsThunk());

    const storeError = store.getState().location.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed responsible zones fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getResponsibleZonesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed responsible persons fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getResponsiblePersonsThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed hashtags fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getHashTagsThunk());

    const storeError = store.getState().hashTags.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
