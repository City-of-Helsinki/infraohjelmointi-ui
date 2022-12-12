import useProjectCardsList from '@/hooks/useProjectCardsList';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import PlanningListProjectsTableHeader from './PlanningListProjectsTableHeader';
import PlanningListProjectsTableRow from './PlanningListProjectsTableRow';

const PlanningListProjectsTable: FC<{ group: any }> = ({ group }: { group: any }) => {
  const [page, setPage] = useState(1);
  const { projectCards } = useProjectCardsList(page);

  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = () => setIsProjectsVisible(!isProjectsVisible);

  const handleScroll = useCallback(() => {
    console.log('scrolling');
  }, []);

  const ref = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    const table = ref.current;
    if (table) {
      table.addEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <table className="planning-list-projects-table" cellSpacing={0}>
      <thead>
        <PlanningListProjectsTableHeader
          group={group}
          isProjectsVisible={isProjectsVisible}
          handleProjectsVisible={handleProjectsVisible}
        />
      </thead>
      <tbody
        ref={ref}
        style={{
          display: 'block',
          maxHeight: '550px',
          overflowY: 'scroll',
          borderBottom: '0.05rem solid var(--color-bus-medium-light)',
        }}
      >
        {isProjectsVisible &&
          projectCards
            .slice(0, 20)
            .map((p) => <PlanningListProjectsTableRow key={p.id} project={p} />)}
      </tbody>
    </table>
  );
};

export default PlanningListProjectsTable;
