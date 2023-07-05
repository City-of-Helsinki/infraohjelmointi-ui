import { useAppDispatch, useAppSelector } from './common';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { PlanningMode } from '@/interfaces/common';
import {
  selectMode,
  setMode,
  setSelectedClass,
  setSelectedDistrict,
  setSelectedMasterClass,
  setSelectedSubClass,
} from '@/reducers/planningSlice';
import _ from 'lodash';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { selectPlanningDistricts } from '@/reducers/locationSlice';

/**
 * Returns the selected class or location from a list of classes or locations if it's found,
 * otherwise it will return null if no selection is made or found.
 *
 * @param list class or location list to compare
 * @param id id of the item to compare
 */
const getSelectedItemOrNull = (list: Array<IClass | ILocation>, id: string | null) =>
  (id ? list.find((l) => l.id === id) : null) as IClass | ILocation | null;

const usePlanningRoutes = () => {
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();
  const batchedPlanningClasses = useAppSelector(selectBatchedPlanningClasses);
  const districts = useAppSelector(selectPlanningDistricts);

  const mode = useAppSelector(selectMode);

  // Listens to the url path and changes mode to either 'planning' or 'coordination' depending on the url
  useEffect(() => {
    if (!pathname) {
      return;
    }

    const rootPath = pathname.split('/')[1].replace(/-/g, '') as PlanningMode;

    if (rootPath && rootPath !== mode) {
      dispatch(setMode(rootPath));
    }
  }, [pathname, mode]);

  // Listen to search params and add the selections to redux
  useEffect(() => {
    const { masterClasses, classes, subClasses } = batchedPlanningClasses;

    const params = new URLSearchParams(search);

    const masterClassId = params.get('masterClass');
    const classId = params.get('class');
    const subClassId = params.get('subClass');
    const districtId = params.get('district');

    const nextMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const nextClass = getSelectedItemOrNull(classes, classId);
    const nextSubClass = getSelectedItemOrNull(subClasses, subClassId);
    const nextDistrict = getSelectedItemOrNull(districts, districtId) as ILocation;

    dispatch(setSelectedMasterClass(nextMasterClass));
    dispatch(setSelectedClass(nextClass));
    dispatch(setSelectedSubClass(nextSubClass));
    dispatch(setSelectedDistrict(nextDistrict));
  }, [mode, search, districts, batchedPlanningClasses]);
};

export default usePlanningRoutes;
