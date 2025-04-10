import { FC, useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { Search } from '@/components/Search';
import { useAppDispatch, useAppSelector } from './hooks/common';
import { Route, Routes } from 'react-router-dom';
import { getListsThunk } from './reducers/listsSlice';
import {
  getCoordinationClassesThunk,
  getForcedToFrameClassesThunk,
  getPlanningClassesThunk,
} from './reducers/classSlice';
import {
  getCoordinationLocationsThunk,
  getForcedToFrameLocationsThunk,
  getPlanningLocationsThunk,
} from './reducers/locationSlice';
import ProjectView from './views/ProjectView';
import PlanningView from './views/PlanningView';
import { ProjectNotes } from './components/Project/ProjectNotes';
import ErrorView from './views/ErrorView';
import AuthGuard from './components/AuthGuard';
import SearchResultsView from './views/SearchResultsView';
import { CustomContextMenu } from './components/CustomContextMenu';
import { getCoordinationGroupsThunk, getForcedToFrameGroupsThunk, getPlanningGroupsThunk } from './reducers/groupSlice';
import { getHashTagsThunk } from './reducers/hashTagsSlice';
import { clearLoading, setLoading } from './reducers/loaderSlice';
import { getSapCostsThunk,getSapCurrentYearThunk } from './reducers/sapCostSlice';
import moment from 'moment';
import 'moment/locale/fi';
import ScrollHandler from './components/shared/ScrollHandler';
import { ProjectBasics } from './components/Project/ProjectBasics';
import { notifyError } from './reducers/notificationSlice';
import ConfirmDialog from './components/shared/ConfirmDialog';
import ReportsView from './views/ReportsView';
import AdminView from './views/AdminView/AdminView';
import AdminHashtags from './components/Admin/AdminHashtags';
import AdminFunctions from './components/Admin/AdminFunctions';
import { selectUser } from './reducers/authSlice';
import useUpdateEvents from './hooks/useUpdateEvents';
import { getCoordinatorNotesThunk, selectStartYear, setIsPlanningLoading } from './reducers/planningSlice';
import AccessDeniedView from './views/AccessDeniedView';
import { isUserOnlyViewer } from './utils/userRoleHelpers';
import MaintenanceView from './views/Maintenance';
import { AppDispatch } from './store';
import AdminForcedToFrame from './components/Admin/AdminForcedToFrame/AdminForcedToFrame';
import { getAppStateValuesThunk } from './reducers/appStateValueSlice';

const LOADING_APP_ID = 'loading-app-data';

export const loadPlanningData = async (dispatch: AppDispatch, year: number) => {
  dispatch(setIsPlanningLoading(true));
  dispatch(setLoading({ text: 'Loading app data', id: "planning" }));
  try {
    await dispatch(getPlanningGroupsThunk(year));
    await dispatch(getPlanningClassesThunk(year));
    await dispatch(getPlanningLocationsThunk(year));
  } catch (e) {
    console.log('Error loading planning data: ', e);
    dispatch(notifyError({ message: 'appDataError', type: 'notification', title: '500' }));
  } finally {
    dispatch(setIsPlanningLoading(false));
    dispatch(clearLoading("planning"));
  }
};

export const loadCoordinationData = async (dispatch: AppDispatch, year: number) => {
  dispatch(setIsPlanningLoading(true));
  dispatch(setLoading({ text: 'Loading app data', id: "coordination" }));
  try {
    await dispatch(getCoordinationGroupsThunk(year));
    await dispatch(getCoordinationClassesThunk(year));
    await dispatch(getCoordinationLocationsThunk(year));
    await dispatch(getForcedToFrameGroupsThunk(year));
    await dispatch(getForcedToFrameClassesThunk(year));
    await dispatch(getForcedToFrameLocationsThunk(year));
  } catch (e) {
    console.log('Error loading coordination data: ', e);
    dispatch(notifyError({ message: 'appDataError', type: 'notification', title: '500' }));
  } finally {
    dispatch(setIsPlanningLoading(false));
    dispatch(clearLoading("coordination"));
  }
}

const App: FC = () => {
  const dispatch = useAppDispatch();
  const [appDataReady, setAppDataReady] = useState(false);
  const user = useAppSelector(selectUser);

  const startYear = useAppSelector(selectStartYear);

  const MAINTENANCE_MODE: boolean = process.env.REACT_APP_MAINTENANCE_MODE === 'true';
  const yearNow: number = new Date().getFullYear();

  useUpdateEvents();

  // Initialize states that are used everywhere in the app
  useEffect(() => {
    const initializeStates = async () => {
      // Set moments locale to finnish for the app
      moment().locale('fi');
  
      // When maintenance mode is on, don't fetch data
      if (MAINTENANCE_MODE) {
        setAppDataReady(true);
        return;
      }
  
      dispatch(setLoading({ text: 'Loading app data', id: LOADING_APP_ID }));
      try {
        setAppDataReady(false);
        await dispatch(getListsThunk());
        await dispatch(getHashTagsThunk());
        await dispatch(getCoordinatorNotesThunk());
        await dispatch(getAppStateValuesThunk());
      } catch (e) {
        console.log('Error getting app data: ', e);
        dispatch(notifyError({ message: 'appDataError', type: 'notification', title: '500' }));
      } finally {
        dispatch(clearLoading(LOADING_APP_ID));
        setAppDataReady(true)
      }
    };
    initializeStates().catch(Promise.reject);
  }, [MAINTENANCE_MODE, dispatch, user]);

  // Changing the startYear in the planning view will trigger a re-fetch of all the planning data
  useEffect(() => {
    // Don't fetch data if maintenance mode is on
    if (MAINTENANCE_MODE) {
      return;
    }

    if (startYear) {
      loadPlanningData(dispatch, startYear);
      // viewers can access only planning view & planning data, so coordination data is not fetched if user has viewer role only
      if (!isUserOnlyViewer(user)) {
        loadCoordinationData(dispatch, startYear);
      }
      dispatch(getSapCostsThunk(yearNow));
      dispatch(getSapCurrentYearThunk(startYear));
    }
  }, [user, startYear, MAINTENANCE_MODE, dispatch]);

  return (
    <div>
      <Search />
      <Notification />
      <TopBar />
      <div className="app-content">
        <SideBar />
        <div className="app-container">
          <Loader />
          {appDataReady && (
            <Routes>
              <Route path="/project/:projectId?" element={<ProjectView />}>
                <Route path="basics" element={<ProjectBasics />} />
                <Route path="new" element={<ProjectBasics />} />
                <Route path="notes" element={<ProjectNotes />} />
              </Route>
              <Route path="/planning" element={<PlanningView />} />
              <Route path="/coordination" element={<PlanningView />} />
              <Route path="/search-results" element={<SearchResultsView />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/admin" element={<AdminView />}>
                <Route path="functions" element={<AdminFunctions />} />
                <Route path="hashtags" element={<AdminHashtags />} />
                <Route path="forcedtoframestate" element={<AdminForcedToFrame />} />
              </Route>
              <Route path="/access-denied" element={<AccessDeniedView />} />
              <Route path="/auth/helsinki/return" element={<></>}></Route>
              <Route path="/maintenance" element={<MaintenanceView />} />
              <Route path="/" element={<></>}></Route>
              <Route path="*" element={<ErrorView />} />
            </Routes>
          )}
        </div>
      </div>
      {/* Display the custom context menu if the custom 'showContextMenu'-event is triggered */}
      <CustomContextMenu />
      {/* Handling scrolling to last position or to the top of the page if the user enters the project form */}
      <ScrollHandler />
      {/* Listens to ConfirmDialogContext and renders if isOpen is true */}
      <ConfirmDialog />
      {/* Handles authentication related stuff */}
      <AuthGuard />
    </div>
  );
};

export default App;
