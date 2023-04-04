import { FC } from 'react';
import { PlanningToolbar } from '@/components/Planning/PlanningToolbar';
import { PlanningInfoPanel } from '@/components/Planning/PlanningInfoPanel';
import { PlanningYearsTable } from '@/components/Planning/PlanningYearsTable';
import { PlanningTable } from '@/components/Planning/PlanningTable';
import { PlanningBreadcrumbs } from '@/components/Planning/PlanningBreadcrumbs';
import usePlanningTableRows from '@/hooks/usePlanningTableRows';
import './styles.css';

const PlanningView: FC = () => {
  const { rows, selections } = usePlanningTableRows();

  return (
    <>
      <PlanningBreadcrumbs selections={selections} />
      <PlanningToolbar />
      <div className="planning-view-container">
        <div className="flex">
          <PlanningInfoPanel selectedMasterClass={selections.selectedMasterClass} />
          <PlanningYearsTable />
        </div>
        <PlanningTable rows={rows} />
      </div>
    </>
  );
};

export default PlanningView;
