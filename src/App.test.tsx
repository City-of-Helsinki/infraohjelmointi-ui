import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { act, waitFor } from '@testing-library/react';
import { renderWithProviders } from './utils/testUtils';
import App from './App';
import { mockGetResponseProvider } from './utils/mockGetResponseProvider';
import mockProjectClasses from './mocks/mockClasses';
import { mockLocations } from './mocks/mockLocations';
import {
  mockProjectCategories,
  mockProjectPhases,
  mockResponsiblePersons,
} from './mocks/mockLists';
import { mockError } from './mocks/mockError';
import {
  getProjectCategoriesThunk,
  getProjectPhasesThunk,
  getResponsiblePersonsThunk,
} from './reducers/listsSlice';
import { IError } from './interfaces/common';
import { getClassesThunk } from './reducers/classSlice';
import { getLocationsThunk } from './reducers/locationSlice';
import { mockHashTags } from './mocks/mockHashTags';
import { getHashTagsThunk } from './reducers/hashTagsSlice';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('App', () => {
  beforeEach(async () => {
    mockGetResponseProvider();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    const { store } = await act(async () => renderWithProviders(<App />));

    const classes = store.getState().class;
    const locations = store.getState().location;
    const lists = store.getState().lists;
    const hashTags = store.getState().hashTags;

    expect(lists.categories).toStrictEqual(mockProjectCategories.data);
    expect(lists.responsiblePersons).toStrictEqual(mockResponsiblePersons.data);
    expect(lists.phase).toStrictEqual(mockProjectPhases.data);
    expect(hashTags.hashTags).toStrictEqual(mockHashTags.data.hashTags);
    expect(hashTags.popularHashTags).toStrictEqual(mockHashTags.data.popularHashTags);
    expect(classes.allClasses).toStrictEqual(mockProjectClasses.data);
    expect(classes.masterClasses.length).toBeGreaterThan(0);
    expect(classes.classes.length).toBeGreaterThan(0);
    expect(classes.subClasses.length).toBeGreaterThan(0);
    expect(locations.allLocations).toStrictEqual(mockLocations.data);
    expect(locations.districts.length).toBeGreaterThan(0);
    expect(locations.divisions.length).toBeGreaterThan(0);
    expect(locations.subDivisions.length).toBeGreaterThan(0);
  });

  it('renders TopBar', async () => {
    const { getByTestId } = await act(async () => renderWithProviders(<App />));
    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders SideBar', async () => {
    const { getByTestId } = await act(async () => renderWithProviders(<App />));
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders app-content', async () => {
    const { container } = await act(async () => renderWithProviders(<App />));
    expect(container.getElementsByClassName('app-content').length).toBe(1);
  });

  it('does not render Loader', async () => {
    const { container } = await act(async () => renderWithProviders(<App />));
    expect(container.getElementsByClassName('loader-overlay').length).toBe(0);
  });

  it('does not render Notification', async () => {
    const { container } = await act(async () => renderWithProviders(<App />));
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  it('landing on a bad page', async () => {
    const { getByText, getByTestId } = await act(() =>
      renderWithProviders(<App />, {}, { route: '/something-that-does-not-match' }),
    );
    await waitFor(() => {
      expect(getByText('error.404')).toBeInTheDocument();
      expect(getByText('error.pageNotFound')).toBeInTheDocument();
      expect(getByTestId('return-to-previous-btn')).toBeInTheDocument();
    });
  });

  it('catches a failed phase list fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getProjectPhasesThunk());

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

  it('catches a failed responsible persons fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getResponsiblePersonsThunk());

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

  it('catches a failed hashtags fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getHashTagsThunk());

    const storeError = store.getState().hashTags.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
