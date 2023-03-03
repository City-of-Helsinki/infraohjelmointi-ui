import { FC, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { Search } from '@/components/Search';
import { useAppDispatch } from './hooks/common';
import { Route, Routes } from 'react-router-dom';
import {
  getProjectCategoriesThunk,
  getResponsiblePersonsThunk,
  getProjectPhasesThunk,
} from './reducers/listsSlice';
import {
  getClassesThunk,
  setClasses,
  setMasterClasses,
  setSubClasses,
} from './reducers/classSlice';
import {
  getLocationsThunk,
  setDistricts,
  setDivisions,
  setSubDivisions,
} from './reducers/locationSlice';
import ProjectView from './views/ProjectView';
import { ProjectBasics } from './components/Project/ProjectBasics';
import PlanningView from './views/PlanningView';
import { ProjectNotes } from './components/Project/ProjectNotes';
import ErrorView from './views/ErrorView';
import AuthGuard from './components/AuthGuard';
import { getHashTagsThunk } from './reducers/hashTagsSlice';
import SearchResultsView from './views/SearchResultsView';

const App: FC = () => {
  const dispatch = useAppDispatch();

  // Initialize lists that are used everywhere in the app
  useEffect(() => {
    dispatch(getProjectCategoriesThunk());
    dispatch(getResponsiblePersonsThunk());
    dispatch(getProjectPhasesThunk());
    dispatch(getHashTagsThunk());
    // Get classes and filter them into categories
    dispatch(getClassesThunk()).then(() => {
      dispatch(setMasterClasses());
      dispatch(setClasses());
      dispatch(setSubClasses());
    });
    // Get locations and filter them into categories
    dispatch(getLocationsThunk()).then(() => {
      dispatch(setDistricts());
      dispatch(setDivisions());
      dispatch(setSubDivisions());
    });
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
          <Routes>
            <Route path="/project/:projectId?" element={<ProjectView />}>
              <Route path="basics" element={<ProjectBasics />} />
              <Route path="notes" element={<ProjectNotes />} />
            </Route>
            <Route path="/planning">
              <Route path="planner" element={<PlanningView />} />
              {/* these optional routes should work according to newest doc...
              https://github.com/remix-run/react-router/releases/tag/react-router%406.5.0
              <Route
                path="coordinator/:masterClassId?/:classId?/:subClassId?"
                element={<PlanningView />}
              /> 
              */}
              <Route path="coordinator" element={<PlanningView />}>
                <Route path=":masterClassId" element={<PlanningView />}>
                  <Route path=":classId" element={<PlanningView />}>
                    <Route path=":subClassId" element={<PlanningView />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="/search-results" element={<SearchResultsView />} />
            <Route path="*" element={<ErrorView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
