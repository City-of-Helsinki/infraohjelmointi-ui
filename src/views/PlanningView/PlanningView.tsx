import { FC, useEffect } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningSummaryTable } from '@/components/Planning/PlanningSummaryTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import { CoordinatorNotesDialog } from '@/components/CoordinatorNotesDialog';
import usePlanningRows from '@/hooks/usePlanningRows';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectIsPlanningLoading, selectSelectedYear } from '@/reducers/planningSlice';
import usePlanningRoutes from '@/hooks/usePlanningRoutes';
import useCoordinationRows from '@/hooks/useCoordinationRows';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import './styles.css';

const LOADING_PLANNING_DATA_ID = 'loading-planning-data';

const PlanningView: FC = () => {
  const dispatch = useAppDispatch();
  const selectedYear = useAppSelector(selectSelectedYear);
  const isPlanningLoading = useAppSelector(selectIsPlanningLoading);

  useEffect(() => {
    if (isPlanningLoading) {
      dispatch(setLoading({ text: 'Loading planning data', id: LOADING_PLANNING_DATA_ID }));
    } else {
      dispatch(clearLoading(LOADING_PLANNING_DATA_ID));
    }
  }, [isPlanningLoading]);

  usePlanningRows();
  useCoordinationRows();
  usePlanningRoutes();

  return (
    <>
      <PlanningBreadcrumbs />
      <PlanningToolbar />
      {!isPlanningLoading && (
        <div
          className={`planning-view-container ${selectedYear ? '!mr-20' : ''}`}
          id="planning-view"
        >
          <div className="planning-header-container">
            <CoordinatorNotesDialog />
            <PlanningInfoPanel />
            <PlanningSummaryTable />
          </div>
          <PlanningTable />
        </div>
      )}
    </>
  );
};

export default PlanningView;
