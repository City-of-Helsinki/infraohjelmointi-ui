import { useAppDispatch, useAppSelector } from './common';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { PlanningMode } from '@/interfaces/planningInterfaces';
import {
  resetSelections,
  selectPlanningMode,
  setPlanningMode,
  setSelectedClass,
  setSelectedSubLevelDistrict,
  setSelectedCollectiveSubLevel,
  setSelectedDistrict,
  setSelectedMasterClass,
  setSelectedOtherClassification,
  setSelectedSubClass,
  setForcedToFrame,
  selectForcedToFrame,
} from '@/reducers/planningSlice';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import {
  selectBatchedCoordinationClasses,
  selectBatchedPlanningClasses,
  selectPlanningOtherClassifications,
} from '@/reducers/classSlice';
import { selectCoordinationDistricts, selectPlanningDistricts } from '@/reducers/locationSlice';

/**
 * Returns the selected class or location from a list of classes or locations if it's found,
 * otherwise it will return null if no selection is made or found.
 *
 * @param list class or location list to compare
 * @param id id of the item to compare
 */
const getSelectedItemOrNull = (list: Array<IClass | ILocation>, id: string | null) =>
  (id ? list.find((l) => l.id === id) : null) as IClass | ILocation | null;

// TODO: when we get authentication we need to check here
// - if the mode is coordinator and the user is a planner and forcedToFrame is false this url shouldn't be allowed
// - if the mode is coordinator and the user is a coordinator then forcedToFrame should MAYBE not be toggleable (?)
const usePlanningRoutes = () => {
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();
  const batchedPlanningClasses = useAppSelector(selectBatchedPlanningClasses);
  const batchedCoordinatorClasses = useAppSelector(selectBatchedCoordinationClasses);
  const planningDistricts = useAppSelector(selectPlanningDistricts);
  const coordinationDistricts = useAppSelector(selectCoordinationDistricts);
  const otherClassifications = useAppSelector(selectPlanningOtherClassifications);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

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
      // Set forcedToFrame to 'false' if the path is changed to 'planning' while forcedToFrame is 'true'
      if (rootPath === 'planning' && forcedToFrame) {
        dispatch(setForcedToFrame(false));
      }
    }
  }, [pathname, mode, dispatch, forcedToFrame]);

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
    const otherClassificationId = params.get('otherClassification');

    const nextMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const nextClass = getSelectedItemOrNull(classes, classId);
    const nextSubClass = getSelectedItemOrNull(subClasses, subClassId);
    const nextDistrict = getSelectedItemOrNull(planningDistricts, districtId) as ILocation;
    const nextOtherClassification = getSelectedItemOrNull(otherClassifications, otherClassificationId);

    dispatch(setSelectedMasterClass(nextMasterClass));
    dispatch(setSelectedClass(nextClass));
    dispatch(setSelectedSubClass(nextSubClass));
    dispatch(setSelectedDistrict(nextDistrict));
    dispatch(setSelectedOtherClassification(nextOtherClassification));
  }, [mode, search, planningDistricts, otherClassifications, batchedPlanningClasses, dispatch]);

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
    const subLevelDistrictId = params.get('subLevelDistrict');
    const otherClassificationId = params.get('otherClassification');

    const nextMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const nextClass = getSelectedItemOrNull(classes, classId);
    const nextSubClass = getSelectedItemOrNull(subClasses, subClassId);
    const nextDistrict = getSelectedItemOrNull(coordinationDistricts, districtId) as ILocation;
    const nextCollectiveSubLevel = getSelectedItemOrNull(collectiveSubLevels, collectiveSubLevelId);
    const nextSubLevelDistrict = getSelectedItemOrNull(
      coordinationDistricts,
      subLevelDistrictId,
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
    dispatch(setSelectedSubLevelDistrict(nextSubLevelDistrict));
    dispatch(setSelectedOtherClassification(nextOtherClassification));
  }, [mode, search, batchedPlanningClasses, coordinationDistricts, batchedCoordinatorClasses, dispatch]);
};

export default usePlanningRoutes;
