import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { act, waitFor } from '@testing-library/react';
import { renderWithProviders } from './utils/testUtils';
import App from './App';
import { mockGetResponseProvider } from './utils/mockGetResponseProvider';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from './mocks/mockClasses';
import {
  mockDistricts,
  mockDivisions,
  mockLocations,
  mockSubDivisions,
} from './mocks/mockLocations';
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
} from './mocks/mockLists';
import { mockError } from './mocks/mockError';
import { IError } from './interfaces/common';
import { getClassesThunk } from './reducers/classSlice';
import { getLocationsThunk } from './reducers/locationSlice';
import { mockHashTags } from './mocks/mockHashTags';
import { getHashTagsThunk } from './reducers/hashTagsSlice';
import { Route } from 'react-router';
import { getListsThunk } from './reducers/listsSlice';
import { getGroupsThunk } from './reducers/groupSlice';

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
    const { store } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );

    const classes = store.getState().class;

    const locations = store.getState().location;
    const lists = store.getState().lists;
    const hashTags = store.getState().hashTags;

    await waitFor(() => {
      expect(lists.categories).toStrictEqual(mockProjectCategories.data);
      expect(lists.responsiblePersons).toStrictEqual(mockResponsiblePersons.data);
      expect(lists.phases).toStrictEqual(mockProjectPhases.data);
      expect(lists.areas).toStrictEqual(mockProjectAreas.data);
      expect(lists.types).toStrictEqual(mockProjectTypes.data);
      expect(lists.constructionPhaseDetails).toStrictEqual(mockConstructionPhaseDetails.data);
      expect(lists.riskAssessments).toStrictEqual(mockProjectRisks.data);
      expect(lists.projectQualityLevels).toStrictEqual(mockProjectQualityLevels.data);
      expect(lists.constructionPhases).toStrictEqual(mockConstructionPhases.data);
      expect(lists.planningPhases).toStrictEqual(mockPlanningPhases.data);
      expect(lists.responsibleZones).toStrictEqual(mockResponsibleZones.data);
      expect(hashTags.hashTags).toStrictEqual(mockHashTags.data.hashTags);
      expect(hashTags.popularHashTags).toStrictEqual(mockHashTags.data.popularHashTags);
      expect(classes.allClasses).toStrictEqual(mockProjectClasses.data);
      expect(classes.masterClasses).toStrictEqual(mockMasterClasses.data);
      expect(classes.classes).toStrictEqual(mockClasses.data);
      expect(classes.subClasses).toStrictEqual(mockSubClasses.data);
      expect(locations.allLocations).toStrictEqual(mockLocations.data);
      expect(locations.districts).toStrictEqual(mockDistricts.data);
      expect(locations.divisions).toStrictEqual(mockDivisions.data);
      expect(locations.subDivisions).toStrictEqual(mockSubDivisions.data);
    });
  });

  it('renders TopBar', async () => {
    const { getByTestId } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders SideBar', async () => {
    const { getByTestId } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders app-content', async () => {
    const { container } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    expect(container.getElementsByClassName('app-content').length).toBe(1);
  });

  it('does not render Loader', async () => {
    const { container } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    expect(container.getElementsByClassName('loader-overlay').length).toBe(0);
  });

  it('does not render Notification', async () => {
    const { container } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  it('landing on a bad page', async () => {
    const { getByText, getByTestId } = await act(() =>
      renderWithProviders(
        <Route path="*" element={<App />} />,
        {},
        { route: '/something-that-does-not-match' },
      ),
    );
    await waitFor(() => {
      expect(getByText('error.404')).toBeInTheDocument();
      expect(getByText('error.pageNotFound')).toBeInTheDocument();
      expect(getByTestId('return-to-previous-btn')).toBeInTheDocument();
    });
  });

  it('catches a failed classes fetch', async () => {
    const { store } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getClassesThunk());

    const storeError = store.getState().class.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed locations fetch', async () => {
    const { store } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await store.dispatch(getLocationsThunk());

    const storeError = store.getState().location.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed hashtags fetch', async () => {
    const { store } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await store.dispatch(getHashTagsThunk());

    const storeError = store.getState().hashTags.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed lists fetch', async () => {
    const { store } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await waitFor(() => store.dispatch(getListsThunk()));

    const storeError = store.getState().lists.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed groups fetch', async () => {
    const { store } = await act(async () =>
      renderWithProviders(<Route path="*" element={<App />} />),
    );

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await waitFor(() => store.dispatch(getGroupsThunk()));

    const storeError = store.getState().group.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
