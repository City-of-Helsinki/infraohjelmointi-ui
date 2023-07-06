import { useAppDispatch, useAppSelector } from './common';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { PlanningMode } from '@/interfaces/common';
import {
  resetSelections,
  selectPlanningMode,
  setPlanningMode,
  setSelectedClass,
  setSelectedCollectiveDistrict,
  setSelectedCollectiveSubLevel,
  setSelectedDistrict,
  setSelectedMasterClass,
  setSelectedOtherClassification,
  setSelectedSubClass,
} from '@/reducers/planningSlice';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import {
  selectBatchedCoordinationClasses,
  selectBatchedPlanningClasses,
} from '@/reducers/classSlice';
import { selectCoordinationDistricts, selectPlanningDistricts } from '@/reducers/locationSlice';
import _ from 'lodash';

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
  const batchedCoordinatorClasses = useAppSelector(selectBatchedCoordinationClasses);
  const planningDistricts = useAppSelector(selectPlanningDistricts);
  const coordinationDistricts = useAppSelector(selectCoordinationDistricts);

  const mode = useAppSelector(selectPlanningMode);

  // Listens to the url path and changes mode to either 'planning' or 'coordination' depending on the url
  useEffect(() => {
    if (!pathname) {
      return;
    }

    const rootPath = pathname.split('/')[1].replace(/-/g, '') as PlanningMode;

    if (rootPath && rootPath !== mode) {
      dispatch(resetSelections());
      dispatch(setPlanningMode(rootPath));
    }
  }, [pathname, mode]);

  // Listen to search params and add the planning selections to redux
  useEffect(() => {
    if (mode !== 'planning') {
      return;
    }

    const { masterClasses, classes, subClasses } = batchedPlanningClasses;

    const params = new URLSearchParams(search);

    const masterClassId = params.get('masterClass');
    const classId = params.get('class');
    const subClassId = params.get('subClass');
    const districtId = params.get('district');

    const nextMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const nextClass = getSelectedItemOrNull(classes, classId);
    const nextSubClass = getSelectedItemOrNull(subClasses, subClassId);
    const nextDistrict = getSelectedItemOrNull(planningDistricts, districtId) as ILocation;

    dispatch(setSelectedMasterClass(nextMasterClass));
    dispatch(setSelectedClass(nextClass));
    dispatch(setSelectedSubClass(nextSubClass));
    dispatch(setSelectedDistrict(nextDistrict));
  }, [mode, search, planningDistricts, batchedPlanningClasses]);

  // Listen to search params and add the coordinator selections to redux
  useEffect(() => {
    if (mode !== 'coordination') {
      return;
    }

    const { masterClasses, classes, subClasses, collectiveSubLevels, otherClassifications } =
      batchedCoordinatorClasses;

    const params = new URLSearchParams(search);

    const masterClassId = params.get('masterClass');
    const classId = params.get('class');
    const subClassId = params.get('subClass');
    const districtId = params.get('district');
    const collectiveSubLevelId = params.get('collectiveSubLevel');
    const collectiveDistrictId = params.get('collectiveDistrict');
    const otherClassificationId = params.get('otherClassification');

    const nextMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const nextClass = getSelectedItemOrNull(classes, classId);
    const nextSubClass = getSelectedItemOrNull(subClasses, subClassId);
    const nextDistrict = getSelectedItemOrNull(coordinationDistricts, districtId) as ILocation;
    const nextCollectiveSubLevel = getSelectedItemOrNull(collectiveSubLevels, collectiveSubLevelId);
    const nextCollectiveDistrict = getSelectedItemOrNull(
      coordinationDistricts,
      collectiveDistrictId,
    ) as ILocation;
    const nextOtherClassification = getSelectedItemOrNull(
      otherClassifications,
      otherClassificationId,
    );

    dispatch(setSelectedMasterClass(nextMasterClass));
    dispatch(setSelectedClass(nextClass));
    dispatch(setSelectedSubClass(nextSubClass));
    dispatch(setSelectedDistrict(nextDistrict));
    dispatch(setSelectedCollectiveSubLevel(nextCollectiveSubLevel));
    dispatch(setSelectedCollectiveDistrict(nextCollectiveDistrict));
    dispatch(setSelectedOtherClassification(nextOtherClassification));
  }, [mode, search, batchedPlanningClasses, coordinationDistricts]);
};

export default usePlanningRoutes;
