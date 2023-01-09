import { FC } from 'react';
import PlanningInfoPanel from './PlanningInfoPanel';
import PlanningYearsTable from './PlanningYearsTable';
import PlanningProjectsTable from './PlanningProjectsTable';
import { planGroups } from '@/mocks/common';

const PlanningTable: FC = () => {
  return (
    <div className="planning-table-container">
      <div className="display-flex">
        <PlanningInfoPanel />
        <PlanningYearsTable />
      </div>
      {planGroups.map((g) => (
        <PlanningProjectsTable key={g.name} group={g} />
      ))}
    </div>
  );
};

export default PlanningTable;
