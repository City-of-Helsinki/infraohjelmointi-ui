import { FC } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningSummaryTable } from '@/components/Planning/PlanningSummaryTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import usePlanningRows from '@/hooks/usePlanningRows';
import './styles.css';

const PlanningView: FC = () => {
  const { rows, selections, year, lists } = usePlanningRows();

  return (
    <>
      <PlanningBreadcrumbs selections={selections} />
      <PlanningToolbar />
      <div className="planning-view-container">
        <div className="mb-2 flex">
          <PlanningInfoPanel selectedMasterClass={selections.selectedMasterClass} />
          <PlanningSummaryTable startYear={year} selections={selections} lists={lists} />
        </div>
        {rows.length > 0 && <PlanningTable rows={rows} />}
      </div>
    </>
  );
};

export default PlanningView;
