import { FC } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningSummaryTable } from '@/components/Planning/PlanningSummaryTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import usePlanningRows from '@/hooks/usePlanningRows';
import { useAppSelector } from '@/hooks/common';
import { selectSelectedYear } from '@/reducers/planningSlice';
import './styles.css';

const PlanningView: FC = () => {
  const selectedYear = useAppSelector(selectSelectedYear);

  usePlanningRows();

  return (
    <>
      <PlanningBreadcrumbs />
      <PlanningToolbar />
      <div className={`planning-view-container ${selectedYear ? '!mr-20' : ''}`} id="planning-view">
        <div className="planning-view-container-header">
          <PlanningInfoPanel />
          <PlanningSummaryTable />
        </div>
        <PlanningTable />
      </div>
    </>
  );
};

export default PlanningView;
