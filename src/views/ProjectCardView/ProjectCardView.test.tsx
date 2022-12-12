import mockI18next from '@/mocks/mockI18next';
import axios, { AxiosError } from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import ProjectCardView from './ProjectCardView';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { mockProjectAreas, mockProjectPhases, mockProjectTypes } from '@/mocks/mockLists';
import {
  getProjectAreasThunk,
  getProjectPhasesThunk,
  getProjectTypesThunk,
} from '@/reducers/listsSlice';
import { RenderResult } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardView', () => {
  const store = setupStore();
  let renderResult: RenderResult;

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));

    mockedAxios.get.mockResolvedValue(mockProjectTypes);
    await store.dispatch(getProjectTypesThunk());

    mockedAxios.get.mockResolvedValue(mockProjectAreas);
    await store.dispatch(getProjectAreasThunk());

    mockedAxios.get.mockResolvedValue(mockProjectPhases);
    await store.dispatch(getProjectPhasesThunk());

    await act(async () => (renderResult = renderWithProviders(<ProjectCardView />, { store })));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    expect(store.getState().projectCard.selectedProjectCard).toBeDefined();
    expect(store.getState().lists.area.length).toBeGreaterThan(0);
    expect(store.getState().lists.type.length).toBeGreaterThan(0);
    expect(store.getState().lists.phase.length).toBeGreaterThan(0);
  });

  it('renders the parent container', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-card-container').length).toBe(1);
  });

  it('renders the ProjectCardToolbar', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-card-toolbar-container').length).toBe(1);
  });

  it('renders the ProjectCardHeader', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
  });

  it('renders the ProjectCardTabs', async () => {
    const { findByTestId } = renderResult;
    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });

  it('catches a failed project card fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));

    const storeError = store.getState().projectCard.error as IError;
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

  it('catches a failed area fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getProjectAreasThunk());

    const storeError = store.getState().lists.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
