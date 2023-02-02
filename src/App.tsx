import { FC, useEffect } from 'react';
import { Outlet } from 'react-router';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { Search } from '@/components/Search';
import { useAppDispatch } from './hooks/common';
import { getProjectCategoriesThunk, getResponsiblePersonsThunk } from './reducers/listsSlice';
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

const App: FC = () => {
  const dispatch = useAppDispatch();

  // Initialize lists that are used everywhere in the app
  useEffect(() => {
    dispatch(getProjectCategoriesThunk());
    dispatch(getResponsiblePersonsThunk());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Search />
      <Notification />
      <TopBar />
      <div className="app-content">
        <SideBar />
        <div className="w-100-p" data-testid="app-outlet">
          <Loader />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
