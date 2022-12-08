import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { FC, useState } from 'react';
import PlanningListProjectsTableHeader from './PlanningListProjectsTableHeader';
import PlanningListProjectsTableRow from './PlanningListProjectsTableRow';

const PlanningListProjectsTable: FC<{ group: any }> = ({ group }: { group: any }) => {
  const projectCards = useAppSelector((state: RootState) => state.projectCard.projectCards);

  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = () => setIsProjectsVisible(!isProjectsVisible);
  return (
    <table className="planning-list-projects-table" cellSpacing={0}>
      <thead>
        <PlanningListProjectsTableHeader
          group={group}
          isProjectsVisible={isProjectsVisible}
          handleProjectsVisible={handleProjectsVisible}
        />
      </thead>
      <tbody>
        {isProjectsVisible &&
          projectCards.map((p) => <PlanningListProjectsTableRow key={p.name} project={p} />)}
      </tbody>
    </table>
  );
};

export default PlanningListProjectsTable;
