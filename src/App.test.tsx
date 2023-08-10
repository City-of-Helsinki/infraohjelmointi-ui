import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { act, waitFor } from '@testing-library/react';
import {
  renderWithProviders,
  sendFinanceUpdateEvent,
  sendProjectUpdateEvent,
} from './utils/testUtils';
import App from './App';
import { mockGetResponseProvider } from './utils/mockGetResponseProvider';
import {
  mockClasses,
  mockCoordinatorClasses,
  mockCoordinatorCollectiveSubLevels,
  mockCoordinatorMasterClasses,
  mockCoordinatorOtherClassificationSubLevels,
  mockCoordinatorOtherClassifications,
  mockCoordinatorSubClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockProjectCoordinatorClasses,
  mockSubClasses,
} from './mocks/mockClasses';
import {
  mockCoordinatorDistricts,
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
import { getPlanningClassesThunk, sortClassByName } from './reducers/classSlice';
import { getPlanningLocationsThunk } from './reducers/locationSlice';
import { mockHashTags } from './mocks/mockHashTags';
import { getHashTagsThunk } from './reducers/hashTagsSlice';
import { Route } from 'react-router';
import { getListsThunk } from './reducers/listsSlice';
import { getGroupsThunk } from './reducers/groupSlice';
import mockProject from './mocks/mockProject';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const render = async () =>
  await act(async () => renderWithProviders(<Route path="*" element={<App />} />));

describe('App', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    const { store } = await render();

    const {
      class: { planning: planningClasses, coordination: coordinationClasses },
      location: { planning: planningLocations, coordination: coordinationLocations },
      lists,
      hashTags,
    } = store.getState();
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
      const sortedPlanningMasterClasses = sortClassByName(mockMasterClasses.data);
      const sortedPlanningClasses = sortClassByName(mockClasses.data);
      const sortedPlanningSubClasses = sortClassByName(mockSubClasses.data);
      // Planning classes
      expect(planningClasses.allClasses).toStrictEqual(mockProjectClasses.data);
      expect(planningClasses.masterClasses).toStrictEqual(sortedPlanningMasterClasses);
      expect(planningClasses.classes).toStrictEqual(sortedPlanningClasses);
      expect(planningClasses.subClasses).toStrictEqual(sortedPlanningSubClasses);
      // Coordinator classes
      const sortedCoordinatorMasterClasses = sortClassByName(mockCoordinatorMasterClasses.data);
      const sortedCoordinatorClasses = sortClassByName(mockCoordinatorClasses.data);
      const sortedCoordinatorSubClasses = sortClassByName(mockCoordinatorSubClasses.data);
      const sortedCoordinatorCollectiveSubLevels = sortClassByName(
        mockCoordinatorCollectiveSubLevels.data,
      );
      const sortedCoordinatorOtherClassifications = sortClassByName(
        mockCoordinatorOtherClassifications.data,
      );
      const sortedCoordinatorOtherClassificationSubLevels = sortClassByName(
        mockCoordinatorOtherClassificationSubLevels.data,
      );

      expect(coordinationClasses.allClasses).toStrictEqual(mockProjectCoordinatorClasses.data);
      expect(coordinationClasses.masterClasses).toStrictEqual(sortedCoordinatorMasterClasses);
      expect(coordinationClasses.classes).toStrictEqual(sortedCoordinatorClasses);
      expect(coordinationClasses.subClasses).toStrictEqual(sortedCoordinatorSubClasses);
      expect(coordinationClasses.collectiveSubLevels).toStrictEqual(
        sortedCoordinatorCollectiveSubLevels,
      );
      expect(coordinationClasses.otherClassifications).toStrictEqual(
        sortedCoordinatorOtherClassifications,
      );
      expect(coordinationClasses.otherClassificationSubLevels).toStrictEqual(
        sortedCoordinatorOtherClassificationSubLevels,
      );
      // Planning locations
      expect(planningLocations.allLocations).toStrictEqual(mockLocations.data);
      expect(planningLocations.districts).toStrictEqual(mockDistricts.data);
      expect(planningLocations.divisions).toStrictEqual(mockDivisions.data);
      expect(planningLocations.subDivisions).toStrictEqual(mockSubDivisions.data);
      // Coordinator locations
      expect(coordinationLocations.districts).toStrictEqual(mockCoordinatorDistricts.data);
    });
  });

  it('renders TopBar', async () => {
    const { getByTestId } = await render();
    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders SideBar', async () => {
    const { getByTestId } = await render();
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders app-content', async () => {
    const { container } = await render();
    expect(container.getElementsByClassName('app-content').length).toBe(1);
  });

  it('does not render Loader', async () => {
    const { container } = await render();
    expect(container.getElementsByClassName('loader-overlay').length).toBe(0);
  });

  it('does not render Notification', async () => {
    const { container } = await render();
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  it('listens to the project-update event stream and updates redux eventSlice', async () => {
    const { store } = await render();

    await sendProjectUpdateEvent(mockProject.data);

    await waitFor(() => {
      expect(store.getState().events.projectUpdate?.project).toStrictEqual(mockProject.data);
    });
  });

  it('listens to the finance-update event stream and updates redux eventSlice', async () => {
    const { store } = await render();

    await sendFinanceUpdateEvent({ masterClass: mockMasterClasses.data[0] });

    await waitFor(() => {
      expect(store.getState().events.financeUpdate?.masterClass).toStrictEqual(
        mockMasterClasses.data[0],
      );
    });
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
      expect(getByTestId('return-to-frontpage-btn')).toBeInTheDocument();
    });
  });

  it('catches a failed planning classes fetch', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await store.dispatch(getPlanningClassesThunk());

    const storeError = store.getState().class.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed locations fetch', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await store.dispatch(getPlanningLocationsThunk());

    const storeError = store.getState().location.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed hashtags fetch', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await store.dispatch(getHashTagsThunk());

    const storeError = store.getState().hashTags.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed lists fetch', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await waitFor(() => store.dispatch(getListsThunk()));

    const storeError = store.getState().lists.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a failed groups fetch', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await waitFor(() => store.dispatch(getGroupsThunk()));

    const storeError = store.getState().group.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
