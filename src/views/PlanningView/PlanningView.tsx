import { FC } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningSummaryTable } from '@/components/Planning/PlanningSummaryTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import usePlanningRows from '@/hooks/usePlanningRows';
import './styles.css';

const PlanningView: FC = () => {
  const { rows, selections, startYear } = usePlanningRows();

  return (
    <>
      <PlanningBreadcrumbs selections={selections} />
      <PlanningToolbar />
      <div className="planning-view-container">
        <div className="mb-2 flex">
          <PlanningInfoPanel selectedMasterClass={selections.selectedMasterClass} />
          <PlanningSummaryTable
            startYear={startYear}
            selectedMasterClass={selections.selectedMasterClass}
          />
        </div>
        {rows.length > 0 && <PlanningTable rows={rows} />}
      </div>
    </>
  );
};

export default PlanningView;
