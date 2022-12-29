import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import ProjectView from './ProjectView';
import { getProjectThunk } from '@/reducers/projectSlice';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
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
import {
  getConstructionPhaseDetailsThunk,
  getConstructionPhasesThunk,
  getPlanningPhasesThunk,
  getProjectAreasThunk,
  getProjectCategoriesThunk,
  getProjectPhasesThunk,
  getProjectQualityLevelsThunk,
  getProjectRisksThunk,
  getProjectTypesThunk,
} from '@/reducers/listsSlice';
import { RenderResult } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectView', () => {
  const store = setupStore();
  let renderResult: RenderResult;

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProject);
    await store.dispatch(getProjectThunk(mockProject.data.id));

    mockedAxios.get.mockResolvedValue(mockProjectTypes);
    await store.dispatch(getProjectTypesThunk());

    mockedAxios.get.mockResolvedValue(mockProjectAreas);
    await store.dispatch(getProjectAreasThunk());

    mockedAxios.get.mockResolvedValue(mockProjectPhases);
    await store.dispatch(getProjectPhasesThunk());

    mockedAxios.get.mockResolvedValue(mockConstructionPhaseDetails);
    await store.dispatch(getConstructionPhaseDetailsThunk());

    mockedAxios.get.mockResolvedValue(mockProjectCategories);
    await store.dispatch(getProjectCategoriesThunk());

    mockedAxios.get.mockResolvedValue(mockProjectRisks);
    await store.dispatch(getProjectRisksThunk());

    mockedAxios.get.mockResolvedValue(mockProjectQualityLevels);
    await store.dispatch(getProjectQualityLevelsThunk());

    mockedAxios.get.mockResolvedValue(mockPlanningPhases);
    await store.dispatch(getPlanningPhasesThunk());

    mockedAxios.get.mockResolvedValue(mockConstructionPhases);
    await store.dispatch(getConstructionPhasesThunk());

    await act(async () => (renderResult = renderWithProviders(<ProjectView />, { store })));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    expect(store.getState().project.selectedProject).toBeDefined();
    expect(store.getState().lists.area.length).toBeGreaterThan(0);
    expect(store.getState().lists.type.length).toBeGreaterThan(0);
    expect(store.getState().lists.phase.length).toBeGreaterThan(0);
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
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectThunk(mockProject.data.id));

    const storeError = store.getState().project.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed phase list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectPhasesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed type list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectTypesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed area list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectAreasThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed constructionPhaseDetails list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getConstructionPhaseDetailsThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectCategories list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectCategoriesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectRisks list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectRisksThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed projectQualityLevel list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectQualityLevelsThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed planningPhase list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getPlanningPhasesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed constructionPhase list fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getConstructionPhasesThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});