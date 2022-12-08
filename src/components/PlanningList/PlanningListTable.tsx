import { FC } from 'react';
import PlanningListInfoPanel from './PlanningListInfoPanel';
import PlanningListYearsTable from './PlanningListYearsTable';
import PlanningListProjectsTable from './PlanningListProjectsTable';

const PlanningListTable: FC = () => {
  return (
    <div className="planning-list-table-container">
      <div className="display-flex">
        <PlanningListInfoPanel />
        <PlanningListYearsTable />
      </div>
      <PlanningListProjectsTable />
    </div>
  );
};

export default PlanningListTable;
