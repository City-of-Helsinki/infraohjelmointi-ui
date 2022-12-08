import { FC } from 'react';
import PlanningListInfoPanel from './PlanningListInfoPanel';
import PlanningListYearsTable from './PlanningListYearsTable';
import PlanningListProjectsTable from './PlanningListProjectsTable';
import { planListGroups } from '@/mocks/common';

const PlanningListTable: FC = () => {
  return (
    <div className="planning-list-table-container">
      <div className="display-flex">
        <PlanningListInfoPanel />
        <PlanningListYearsTable />
      </div>
      {planListGroups.map((g) => (
        <PlanningListProjectsTable key={g.name} group={g} />
      ))}
    </div>
  );
};

export default PlanningListTable;
