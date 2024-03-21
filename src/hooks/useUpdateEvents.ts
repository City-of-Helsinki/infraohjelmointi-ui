import {
  updateMasterClass,
  updateClass,
  updateSubClass,
  updateCollectiveSubLevel,
  updateOtherClassification,
  updateOtherClassificationSubLevel,
  selectBatchedPlanningClasses,
  IClassHierarchy,
  selectBatchedCoordinationClasses,
  ICoordinatorClassHierarchy,
  selectBatchedForcedToFrameClasses,
} from '@/reducers/classSlice';
import { selectCoordinationGroups, selectPlanningGroups, updateGroup } from '@/reducers/groupSlice';
import { ILocationHierarchy, selectBatchedCoordinationLocations, selectBatchedForcedToFrameLocations, selectBatchedPlanningLocations, updateDistrict } from '@/reducers/locationSlice';
import {
  addFinanceUpdateEventListener,
  addProjectUpdateEventListener,
  eventSource,
  removeFinanceUpdateEventListener,
  removeProjectUpdateEventListener,
} from '@/utils/events';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import { selectFinanceUpdate, selectProjectUpdate } from '@/reducers/eventsSlice';
import { IFinanceCoordinationData, IFinancePlanningData } from '../interfaces/eventInterfaces'
import { selectProjects, selectStartYear, setProjects } from '@/reducers/planningSlice';
import { syncUpdatedClassFinancesWithStartYear, syncUpdatedProjectFinancesWithStartYear } from '@/utils/common';
import { IClass, IClassBudgets, IClassFinances } from '@/interfaces/classInterfaces';
import { IGroup } from '@/interfaces/groupInterfaces';
import { IProject, IProjectFinances } from '@/interfaces/projectInterfaces';

const initialClassBudgets: IClassBudgets = {
  plannedBudget: 0,
  frameBudget: 0,
  isFrameBudgetOverlap: false
}

const initialClassFinances: IClassFinances = {
  year: new Date().getFullYear(),
  budgetOverrunAmount: 0,
  year0: initialClassBudgets,
  year1: initialClassBudgets,
  year2: initialClassBudgets,
  year3: initialClassBudgets,
  year4: initialClassBudgets,
  year5: initialClassBudgets,
  year6: initialClassBudgets,
  year7: initialClassBudgets,
  year8: initialClassBudgets,
  year9: initialClassBudgets,
  year10: initialClassBudgets
}

const initialLocationFinances = {
  ...initialClassFinances,
  parentClass: null
}

const initalProjectFinances: IProjectFinances = {
  year: 0,
  budgetProposalCurrentYearPlus0: null,
  budgetProposalCurrentYearPlus1: null,
  budgetProposalCurrentYearPlus2: null,
  preliminaryCurrentYearPlus3: null,
  preliminaryCurrentYearPlus4: null,
  preliminaryCurrentYearPlus5: null,
  preliminaryCurrentYearPlus6: null,
  preliminaryCurrentYearPlus7: null,
  preliminaryCurrentYearPlus8: null,
  preliminaryCurrentYearPlus9: null,
  preliminaryCurrentYearPlus10: null
}

const getExistingClassById = (classes: Array<IClass>, classId: string) => classes.find(({ id }) => id === classId);
const getExistingGroupById = (classes: Array<IGroup>, classId: string) => classes.find(({ id }) => id === classId);

const syncClassFinances = (classDataFromState: IClassHierarchy, financesFromUpdateEvent: IFinancePlanningData | IFinanceCoordinationData, startYear: number) => {
  const updatedFinances = {...financesFromUpdateEvent};
  if (updatedFinances.class?.finances) {
    const financeDataToUpdate = getExistingClassById(classDataFromState.classes, updatedFinances.class.id)?.finances ?? initialClassFinances;
    updatedFinances.class = {
      ...updatedFinances.class,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.class.finances, startYear)
    };
  }
  if (updatedFinances.masterClass?.finances) {
    const financeDataToUpdate = getExistingClassById(classDataFromState.masterClasses, updatedFinances.masterClass.id)?.finances ?? initialClassFinances;
    updatedFinances.masterClass = {
      ...updatedFinances.masterClass,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.masterClass.finances, startYear)
    };
  }
  if (updatedFinances.subClass?.finances) {
    const financeDataToUpdate = getExistingClassById(classDataFromState.subClasses, updatedFinances.subClass.id)?.finances ?? initialClassFinances;
    updatedFinances.subClass = {
      ...updatedFinances.subClass,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.subClass.finances, startYear)
    };
  }
  return updatedFinances;
}

const syncLocationFinances = (locationDataFromState: ILocationHierarchy | Omit<ILocationHierarchy, 'allLocations' | 'divisions' | 'subDivisions'>, financesFromUpdateEvent: IFinancePlanningData | IFinanceCoordinationData, startYear: number) => {
  const updatedFinances = {...financesFromUpdateEvent};
  if (updatedFinances.district?.finances) {
    const financeDataToUpdate = getExistingClassById(locationDataFromState.districts, updatedFinances.district.id)?.finances ?? initialLocationFinances;
    updatedFinances.district = {
      ...updatedFinances.district,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.district.finances, startYear)
    };
  }
  return updatedFinances;
}

const syncGroupFinances = (groupDataFromState: IGroup[], financesFromUpdateEvent: IFinancePlanningData | IFinanceCoordinationData, startYear: number) => {
  const updatedFinances = {...financesFromUpdateEvent};
  if (updatedFinances.group?.finances) {
    const financeDataToUpdate = getExistingGroupById(groupDataFromState, updatedFinances.group.id)?.finances ?? initialClassFinances;
    updatedFinances.group = {
      ...updatedFinances.group,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.group.finances, startYear)
    };
  }
  return updatedFinances;
}

const syncCoordinationFinances = (financesFromState: ICoordinatorClassHierarchy, financesFromUpdateEvent: IFinanceCoordinationData, startYear: number) => {
  const updatedFinances = {...financesFromUpdateEvent};
  if (updatedFinances.collectiveSubLevel?.finances) {
    const financeDataToUpdate = getExistingClassById(financesFromState.collectiveSubLevels, updatedFinances.collectiveSubLevel.id)?.finances ?? initialClassFinances;
    updatedFinances.collectiveSubLevel = {
      ...updatedFinances.collectiveSubLevel,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.collectiveSubLevel.finances, startYear)
    };
  }
  if (updatedFinances.otherClassification?.finances) {
    const financeDataToUpdate = getExistingClassById(financesFromState.otherClassifications, updatedFinances.otherClassification.id)?.finances ?? initialClassFinances;
    updatedFinances.otherClassification = {
      ...updatedFinances.otherClassification,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.otherClassification.finances, startYear)
    };
  }
  if (updatedFinances.otherClassificationSubLevel?.finances) {
    const financeDataToUpdate = getExistingClassById(financesFromState.otherClassificationSubLevels, updatedFinances.otherClassificationSubLevel.id)?.finances ?? initialClassFinances;
    updatedFinances.otherClassificationSubLevel = {
      ...updatedFinances.otherClassificationSubLevel,
      finances: syncUpdatedClassFinancesWithStartYear(financeDataToUpdate, updatedFinances.otherClassificationSubLevel.finances, startYear)
    };
  }
  return updatedFinances;
}

const useUpdateEvents = () => {
  const dispatch = useAppDispatch();
  const financeUpdate = useAppSelector(selectFinanceUpdate);
  const projectUpdateEventData = useAppSelector(selectProjectUpdate);
  const projects = useAppSelector(selectProjects);
  const planningClassDataFromState = useAppSelector(selectBatchedPlanningClasses);
  const coordinationClassDataFromState = useAppSelector(selectBatchedCoordinationClasses);
  const forcedToFrameClassDataFromState = useAppSelector(selectBatchedForcedToFrameClasses);
  const planningLocationDataFromState = useAppSelector(selectBatchedPlanningLocations);
  const coordinationLocationDataFromState = useAppSelector(selectBatchedCoordinationLocations);
  const forcedToFrameLocationDataFromState = useAppSelector(selectBatchedForcedToFrameLocations);
  const plannigGroupsDataFromState = useAppSelector(selectPlanningGroups);
  const coordinationGroupDataFromState = useAppSelector(selectCoordinationGroups);

  const startYear = useAppSelector(selectStartYear);

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
  }, [dispatch]);

  // Listen to finance-update and project-update from redux to see if an update event was triggered
  useEffect(() => {
    if (financeUpdate) {
      let { coordination, planning, forcedToFrame } = financeUpdate;

      // Update all planning finances
      if (planning) {
        planning = syncClassFinances(planningClassDataFromState, planning, startYear);
        planning = syncLocationFinances(planningLocationDataFromState, planning, startYear);
        planning = syncGroupFinances(plannigGroupsDataFromState, planning, startYear);
        const type = 'planning';
        Promise.all([
          dispatch(updateMasterClass({ data: planning.masterClass, type })),
          dispatch(updateClass({ data: planning.class, type })),
          dispatch(updateSubClass({ data: planning.subClass, type })),
          dispatch(updateDistrict({ data: planning.district, type })),
          dispatch(updateGroup({ data: planning.group, type })),
        ]).catch((e) => console.log('Error updating planning finances: ', e));
      }

      // Update all coordination finances
      if (coordination) {
        coordination = {...coordination, ...syncClassFinances(coordinationClassDataFromState, coordination, startYear)};
        coordination = {...coordination, ...syncLocationFinances(coordinationLocationDataFromState, coordination, startYear)};
        coordination = {...coordination, ...syncGroupFinances(coordinationGroupDataFromState, coordination, startYear)};
        coordination = syncCoordinationFinances(coordinationClassDataFromState, coordination, startYear);
        const type = 'coordination';
        Promise.all([
          dispatch(updateMasterClass({ data: coordination.masterClass, type })),
          dispatch(updateClass({ data: coordination.class, type })),
          dispatch(updateSubClass({ data: coordination.subClass, type })),
          dispatch(updateCollectiveSubLevel(coordination.collectiveSubLevel)),
          dispatch(updateOtherClassification(coordination.otherClassification)),
          dispatch(updateOtherClassificationSubLevel(coordination.otherClassificationSubLevel)),
          dispatch(updateGroup({ data: coordination.group, type })),
          dispatch(updateDistrict({ data: coordination.district, type })),
        ]).catch((e) => console.log('Error updating coordination finances: ', e));
      }

      // Update all forced to frame finances
      if (forcedToFrame) {
        forcedToFrame = {...forcedToFrame, ...syncClassFinances(forcedToFrameClassDataFromState, forcedToFrame, startYear)};
        forcedToFrame = {...forcedToFrame, ...syncLocationFinances(forcedToFrameLocationDataFromState, forcedToFrame, startYear)};
        forcedToFrame = {...forcedToFrame, ...syncGroupFinances(coordinationGroupDataFromState, forcedToFrame, startYear)};
        forcedToFrame = syncCoordinationFinances(forcedToFrameClassDataFromState, forcedToFrame, startYear);
        const type = 'forcedToFrame';
        Promise.all([
          dispatch(updateMasterClass({ data: forcedToFrame.masterClass, type })),
          dispatch(updateClass({ data: forcedToFrame.class, type })),
          dispatch(updateSubClass({ data: forcedToFrame.subClass, type })),
          dispatch(updateCollectiveSubLevel(forcedToFrame.collectiveSubLevel)),
          dispatch(updateOtherClassification(forcedToFrame.otherClassification)),
          dispatch(updateOtherClassificationSubLevel(forcedToFrame.otherClassificationSubLevel)),
          dispatch(updateDistrict({ data: forcedToFrame.district, type })),
        ]).catch((e) => console.log('Error updating forced to frame finances: ', e));
      }
    }
    if (projectUpdateEventData?.project) {
      const projectUpdate: IProject = {...projectUpdateEventData.project};
      // converting project finances to start from the selected startYear if it is 
      // different than the start year from the update event
      if (projectUpdate.finances && startYear != projectUpdate.finances.year) {
        const existingProject = projects.find(({ id }) => id === projectUpdate.id);
        const projectToUpdate = existingProject?.finances ?? initalProjectFinances;
        projectUpdate["finances"] = syncUpdatedProjectFinancesWithStartYear(projectToUpdate, projectUpdate.finances, startYear);
      }
      const updatedProjects: IProject[] = projects.map((p) => {
        return p.id === projectUpdate.id ? projectUpdate : p
      });
      Promise.all([
        dispatch(setProjects(updatedProjects))
      ]).catch((e) => console.log('Error updating project data: ', e));
    }
  }, [financeUpdate, projectUpdateEventData]);
};

export default useUpdateEvents;
