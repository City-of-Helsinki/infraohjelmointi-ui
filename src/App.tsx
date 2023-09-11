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
  updateClass,
  updateCollectiveSubLevel,
  updateMasterClass,
  updateOtherClassification,
  updateOtherClassificationSubLevel,
  updateSubClass,
} from './reducers/classSlice';
import {
  getCoordinationLocationsThunk,
  getPlanningLocationsThunk,
  updateDistrict,
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
import AdminView from './views/AdminView/AdminView';
import AdminHashtags from './components/Admin/AdminHashtags';
import AdminFunctions from './components/Admin/AdminFunctions';
import { selectUser } from './reducers/authSlice';

const LOADING_APP_ID = 'loading-app-data';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const [appDataReady, setAppDataReady] = useState(false);
  const financeUpdate = useAppSelector(selectFinanceUpdate);
  const user = useAppSelector(selectUser);

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
    if (user) {
      moment().locale('fi');
      initalizeStates().catch(Promise.reject);
    }
  }, [user]);

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
      const { coordination, planning } = financeUpdate;

      // Update all planning finances
      if (planning) {
        const type = 'planning';
        Promise.all([
          dispatch(updateMasterClass({ data: planning.masterClass, type })),
          dispatch(updateClass({ data: planning.class, type })),
          dispatch(updateSubClass({ data: planning.subClass, type })),
          dispatch(updateDistrict({ data: planning.district, type })),
          dispatch(updateGroup(planning.group)),
        ]).catch((e) => console.log('Error updating planning finances: ', e));
      }

      // Update all coordination finances
      if (coordination) {
        const type = 'coordination';
        Promise.all([
          dispatch(updateMasterClass({ data: coordination.masterClass, type })),
          dispatch(updateClass({ data: coordination.class, type })),
          dispatch(updateSubClass({ data: coordination.subClass, type })),
          dispatch(updateCollectiveSubLevel(coordination.collectiveSubLevel)),
          dispatch(updateOtherClassification(coordination.otherClassification)),
          dispatch(updateOtherClassificationSubLevel(coordination.otherClassificationSubLevel)),
          dispatch(updateDistrict({ data: coordination.district, type })),
        ]).catch((e) => console.log('Error updating coordination finances: ', e));
      }
    }
  }, [financeUpdate]);

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
              </Route>
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
