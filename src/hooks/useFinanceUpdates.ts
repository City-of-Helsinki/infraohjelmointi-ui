import {
  updateMasterClass,
  updateClass,
  updateSubClass,
  updateCollectiveSubLevel,
  updateOtherClassification,
  updateOtherClassificationSubLevel,
} from '@/reducers/classSlice';
import { updateGroup } from '@/reducers/groupSlice';
import { updateDistrict } from '@/reducers/locationSlice';
import {
  addFinanceUpdateEventListener,
  addProjectUpdateEventListener,
  eventSource,
  removeFinanceUpdateEventListener,
  removeProjectUpdateEventListener,
} from '@/utils/events';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import { selectFinanceUpdate } from '@/reducers/eventsSlice';
import { IFinancePlanningData } from '../interfaces/eventInterfaces'
import { selectStartYear } from '@/reducers/planningSlice';
import { syncUpdatedClassFinancesWithStartYear } from '@/utils/common';

const syncFinances = (updatedFinances: IFinancePlanningData, startYear: number) => {
  if (updatedFinances.class?.finances) {
    updatedFinances.class = {
      ...updatedFinances.class,
      finances: syncUpdatedClassFinancesWithStartYear(updatedFinances.class.finances, startYear)
    };
  }
  if (updatedFinances.district?.finances) {
    updatedFinances.district = {
      ...updatedFinances.district,
      finances: syncUpdatedClassFinancesWithStartYear(updatedFinances.district.finances, startYear)
    };
  }
  if (updatedFinances.group?.finances) {
    updatedFinances.group = {
      ...updatedFinances.group,
      finances: syncUpdatedClassFinancesWithStartYear(updatedFinances.group.finances, startYear)
    };
  }
  if (updatedFinances.masterClass?.finances) {
    updatedFinances.masterClass = {
      ...updatedFinances.masterClass,
      finances: syncUpdatedClassFinancesWithStartYear(updatedFinances.masterClass.finances, startYear)
    };
  }
  if (updatedFinances.subClass?.finances) {
    updatedFinances.subClass = {
      ...updatedFinances.subClass,
      finances: syncUpdatedClassFinancesWithStartYear(updatedFinances.subClass.finances, startYear)
    };
  }
  return updatedFinances;
}

const useFinanceUpdates = () => {
  const dispatch = useAppDispatch();
  const financeUpdate = useAppSelector(selectFinanceUpdate);
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

  // Listen to finance-update from redux to see if an update event was triggered
  useEffect(() => {
    if (financeUpdate) {
      const { coordination, forcedToFrame } = financeUpdate;
      let planning = {...financeUpdate.planning};

      // Update all planning finances
      if (planning) {
        planning = syncFinances(planning, startYear);
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
  }, [financeUpdate]);
};

export default useFinanceUpdates;
