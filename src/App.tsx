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
  getPlanningClassesThunk,
  updatePlanningClass,
  updatePlanningMasterClass,
  updatePlanningSubClass,
} from './reducers/classSlice';
import {
  getCoordinationLocationsThunk,
  getPlanningLocationsThunk,
  updatePlanningDistrict,
} from './reducers/locationSlice';
import ProjectView from './views/ProjectView';
import PlanningView from './views/PlanningView';
import { ProjectNotes } from './components/Project/ProjectNotes';
import ErrorView from './views/ErrorView';
import AuthGuard from './components/AuthGuard';
import SearchResultsView from './views/SearchResultsView';
import { CustomContextMenu } from './components/CustomContextMenu';
import { getGroupsThunk, updateGroup } from './reducers/groupSlice';
import { getHashTagsThunk } from './reducers/hashTagsSlice';
import { clearLoading, setLoading } from './reducers/loaderSlice';
import { eventSource } from './utils/events';
import {
  addFinanceUpdateEventListener,
  removeFinanceUpdateEventListener,
  addProjectUpdateEventListener,
  removeProjectUpdateEventListener,
} from '@/utils/events';
import moment from 'moment';
import 'moment/locale/fi';
import ScrollHandler from './components/shared/ScrollHandler';
import { selectFinanceUpdate } from './reducers/eventsSlice';
import { ProjectBasics } from './components/Project/ProjectBasics';
import { notifyError } from './reducers/notificationSlice';
import ConfirmDialog from './components/shared/ConfirmDialog';
import ReportsView from './views/ReportsView';

const LOADING_APP_ID = 'loading-app-data';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const [appDataReady, setAppDataReady] = useState(false);
  const financeUpdate = useAppSelector(selectFinanceUpdate);

  const initalizeStates = async () => {
    dispatch(setLoading({ text: 'Loading app data', id: LOADING_APP_ID }));
    await Promise.all([
      dispatch(getListsThunk()),
      dispatch(getHashTagsThunk()),
      dispatch(getPlanningClassesThunk()),
      dispatch(getPlanningLocationsThunk()),
      dispatch(getGroupsThunk()),
      dispatch(getCoordinationClassesThunk()),
      dispatch(getCoordinationLocationsThunk()),
    ])
      .then(() => {
        setAppDataReady(true);
      })
      .catch((e) => {
        console.log('Error getting app data: ', e);
        dispatch(notifyError({ message: 'appDataError', type: 'notification', title: '500' }));
      })
      .finally(() => {
        dispatch(clearLoading(LOADING_APP_ID));
      });
  };

  // Initialize states that are used everywhere in the app
  useEffect(() => {
    // Set moments locale to finnish for the app
    moment().locale('fi');
    initalizeStates().catch(Promise.reject);
  }, []);

  // Listen to finance-update and project-update events
  useEffect(() => {
    eventSource.onerror = (e) => {
      console.log('Error opening a connection to events: ', e);
    };
    eventSource.onopen = (e) => {
      console.log('Listening to finance-update and project-update events: ', e);
    };

    addFinanceUpdateEventListener(dispatch);
    addProjectUpdateEventListener(dispatch);

    return () => {
      removeFinanceUpdateEventListener(dispatch);
      removeProjectUpdateEventListener(dispatch);
      eventSource.close();
    };
  }, []);

  // Listen to finance-update from redux to see if an update event was triggered
  useEffect(() => {
    if (financeUpdate) {
      console.log('finance update: ', financeUpdate);

      Promise.all([
        dispatch(updatePlanningMasterClass(financeUpdate.masterClass)),
        dispatch(updatePlanningClass(financeUpdate.class)),
        dispatch(updatePlanningSubClass(financeUpdate.subClass)),
        dispatch(updatePlanningDistrict(financeUpdate.district)),
        dispatch(updateGroup(financeUpdate.group)),
      ]).catch((e) => console.log('Error updating finances: ', e));
    }
  }, [financeUpdate]);

  return (
    <div>
      <AuthGuard />
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
              <Route path="*" element={<ErrorView />} />
            </Routes>
          )}
        </div>
      </div>
      {/* Display the custom context menu if the custom 'showContextMenu'-event is triggered */}
      <CustomContextMenu />
      <ScrollHandler />
      {/* CONFIRM DIALOG */}
      <ConfirmDialog />
    </div>
  );
};

export default App;
