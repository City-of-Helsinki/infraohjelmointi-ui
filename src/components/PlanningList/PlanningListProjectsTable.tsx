import { planningListGroups, planningListProjects } from '@/mocks/common';
import { FC, useState } from 'react';
import PlanningListProjectsTableHeader from './PlanningListProjectsTableHeader';
import PlanningListProjectsTableRow from './PlanningListProjectsTableRow';

const PlanningListProjectsTable: FC = () => {
  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = () => setIsProjectsVisible(!isProjectsVisible);
  return (
    <table className="planning-list-projects-table" cellSpacing={0}>
      <thead>
        {planningListGroups.map((g, i) => (
          <PlanningListProjectsTableHeader
            key={i}
            group={g}
            isProjectsVisible={isProjectsVisible}
            handleProjectsVisible={handleProjectsVisible}
          />
        ))}
      </thead>
      <tbody>
        {isProjectsVisible &&
          planningListProjects.map((p) => (
            <PlanningListProjectsTableRow key={p.name} project={p} />
          ))}
      </tbody>
    </table>
  );
};

export default PlanningListProjectsTable;
