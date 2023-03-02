import { FC, useEffect } from 'react';
import { Outlet } from 'react-router';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { Search } from '@/components/Search';
import { useAppDispatch, useAppSelector } from './hooks/common';
import {
  getProjectCategoriesThunk,
  getResponsiblePersonsThunk,
  setClassList,
  setDistrictList,
  setDivisionList,
  setMasterClassList,
  setSubClassList,
  setSubDivisionList,
} from './reducers/listsSlice';
import {
  getClassesThunk,
  selectClasses,
  selectMasterClasses,
  selectSubClasses,
  setClasses,
  setMasterClasses,
  setSubClasses,
} from './reducers/classSlice';
import {
  getLocationsThunk,
  selectDistricts,
  selectDivisions,
  selectSubDivisions,
  setDistricts,
  setDivisions,
  setSubDivisions,
} from './reducers/locationSlice';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const masterClasses = useAppSelector(selectMasterClasses);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);

  const districts = useAppSelector(selectDistricts);
  const divisions = useAppSelector(selectDivisions);
  const subDivisions = useAppSelector(selectSubDivisions);

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
  }, []);

  // Set class lists
  useEffect(() => {
    dispatch(setMasterClassList(masterClasses));
    dispatch(setClassList(classes));
    dispatch(setSubClassList(subClasses));
  }, [masterClasses, classes, subClasses]);

  // Set location lists
  useEffect(() => {
    dispatch(setDistrictList(districts));
    dispatch(setDivisionList(divisions));
    dispatch(setSubDivisionList(subDivisions));
  }, [districts, divisions, subDivisions]);

  return (
    <div>
      <Search />
      <Notification />
      <TopBar />
      <div className="app-content">
        <SideBar />
        <div className="w-full" data-testid="app-outlet">
          <Loader />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
