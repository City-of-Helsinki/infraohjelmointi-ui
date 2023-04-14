import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import ProjectView from './ProjectView';
import { getProjectThunk } from '@/reducers/projectSlice';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';
import { act } from 'react-dom/test-utils';
import {
  mockConstructionPhaseDetails,
  mockConstructionPhases,
  mockPlanningPhases,
  mockProjectAreas,
  mockProjectQualityLevels,
  mockProjectRisks,
  mockProjectTypes,
  mockResponsibleZones,
} from '@/mocks/mockLists';
import {
  getConstructionPhaseDetailsThunk,
  getConstructionPhasesThunk,
  getPlanningPhasesThunk,
  getProjectAreasThunk,
  getProjectQualityLevelsThunk,
  getProjectRisksThunk,
  getProjectTypesThunk,
  getResponsibleZonesThunk,
} from '@/reducers/listsSlice';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { Route } from 'react-router';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectView', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    mockGetResponseProvider();
    await act(
      async () =>
        (renderResult = renderWithProviders(<Route path="/" element={<ProjectView />} />)),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    const { store } = renderResult;

    const lists = store.getState().lists;

    expect(store.getState().project.selectedProject).toStrictEqual(mockProject.data);
    expect(lists.areas).toStrictEqual(mockProjectAreas.data);
    expect(lists.types).toStrictEqual(mockProjectTypes.data);
    expect(lists.areas).toStrictEqual(mockProjectAreas.data);
    expect(lists.types).toStrictEqual(mockProjectTypes.data);
    expect(lists.constructionPhaseDetails).toStrictEqual(mockConstructionPhaseDetails.data);
    expect(lists.riskAssessments).toStrictEqual(mockProjectRisks.data);
    expect(lists.projectQualityLevels).toStrictEqual(mockProjectQualityLevels.data);
    expect(lists.constructionPhases).toStrictEqual(mockConstructionPhases.data);
    expect(lists.planningPhases).toStrictEqual(mockPlanningPhases.data);
    expect(lists.responsibleZones).toStrictEqual(mockResponsibleZones.data);
  });

  it('renders the parent container', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('project-view')).toBeInTheDocument();
  });

  it('renders the ProjectToolbar', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders the ProjectHeader', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('project-header')).toBeInTheDocument();
  });

  it('renders the ProjectTabs', async () => {
    const { findByTestId } = renderResult;
    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });

  it('catches a failed project  fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getProjectThunk(mockProject.data.id)));

    const storeError = store.getState().project.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed type list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getProjectTypesThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed area list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getProjectAreasThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed constructionPhaseDetails list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getConstructionPhaseDetailsThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectRisks list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getProjectRisksThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectQualityLevel list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getProjectQualityLevelsThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed planningPhase list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getPlanningPhasesThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed constructionPhase list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getConstructionPhasesThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed responsible zones fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getResponsibleZonesThunk()));

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
