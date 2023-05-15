import { FC, useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { Search } from '@/components/Search';
import { useAppDispatch } from './hooks/common';
import { Route, Routes } from 'react-router-dom';
import { getListsThunk } from './reducers/listsSlice';
import { getClassesThunk } from './reducers/classSlice';
import { getLocationsThunk } from './reducers/locationSlice';
import ProjectView from './views/ProjectView';
import { ProjectBasics } from './components/Project/ProjectBasics';
import PlanningView from './views/PlanningView';
import { ProjectNotes } from './components/Project/ProjectNotes';
import ErrorView from './views/ErrorView';
import AuthGuard from './components/AuthGuard';
import SearchResultsView from './views/SearchResultsView';
import { CustomContextMenu } from './components/CustomContextMenu';
import { getGroupsThunk } from './reducers/groupSlice';
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

const LOADING_APP_ID = 'loading-app-data';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const [appDataReady, setAppDataReady] = useState(false);

  const initalizeStates = async () => {
    dispatch(setLoading({ text: 'Loading app data', id: LOADING_APP_ID }));
    await Promise.all([
      dispatch(getListsThunk()),
      dispatch(getHashTagsThunk()),
      dispatch(getClassesThunk()),
      dispatch(getLocationsThunk()),
      dispatch(getGroupsThunk()),
    ]).then(() => {
      dispatch(clearLoading(LOADING_APP_ID));
      setAppDataReady(true);
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

  return (
    <div>
      <AuthGuard />
      <Search />
      <Notification />
      <TopBar />
      <div className="app-content">
        <SideBar />
        <div className="w-full">
          <Loader />
          {appDataReady && (
            <Routes>
              <Route path="/project/:projectId?" element={<ProjectView />}>
                <Route path="basics" element={<ProjectBasics />} />
                <Route path="notes" element={<ProjectNotes />} />
              </Route>
              <Route path="/planning" element={<PlanningView />}>
                <Route path=":masterClassId" element={<PlanningView />}>
                  <Route path=":classId" element={<PlanningView />}>
                    <Route path=":subClassId" element={<PlanningView />}>
                      <Route path=":districtId" element={<PlanningView />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
              <Route path="/search-results" element={<SearchResultsView />} />
              <Route path="*" element={<ErrorView />} />
            </Routes>
          )}
        </div>
      </div>
      {/* Display the custom context menu if the custom 'showContextMenu'-event is triggered */}
      <CustomContextMenu />
    </div>
  );
};

export default App;
