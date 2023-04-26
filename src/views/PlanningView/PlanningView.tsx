import { FC } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningYearsTable } from '@/components/Planning/PlanningYearsTable';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import usePlanningRows from '@/hooks/usePlanningRows';
import './styles.css';

const PlanningView: FC = () => {
  const { rows, selections } = usePlanningRows();

  return (
    <>
      <PlanningBreadcrumbs selections={selections} />
      <PlanningToolbar />
      <div className="planning-view-container">
        <div className="flex">
          <PlanningInfoPanel selectedMasterClass={selections.selectedMasterClass} />
          <PlanningYearsTable />
        </div>
        {rows.length > 0 && <PlanningTable rows={rows} />}
      </div>
    </>
  );
};

export default PlanningView;
