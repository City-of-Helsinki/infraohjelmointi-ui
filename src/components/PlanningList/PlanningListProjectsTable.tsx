import useProjectCardsList from '@/hooks/useProjectCardsList';
import { FC, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import PlanningListProjectsTableHeader from './PlanningListProjectsTableHeader';
import PlanningListProjectsTableRow from './PlanningListProjectsTableRow';

const PlanningListProjectsTable: FC<{ group: any }> = ({ group }: { group: any }) => {
  const [page, setPage] = useState(1);
  const { projectCards, isLastProjectsFetched, isFetchingCards } = useProjectCardsList(page);
  const { ref, inView } = useInView();

  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = () => setIsProjectsVisible(!isProjectsVisible);

  useEffect(() => {
    if (inView) {
      setPage(page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <>
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
            projectCards.map((p, i) => <PlanningListProjectsTableRow key={i} project={p} />)}
        </tbody>
      </table>
      {!isFetchingCards && !isLastProjectsFetched && (
        <div data-testid="fetch-projects-triggerer" ref={ref} />
      )}
    </>
  );
};

export default PlanningListProjectsTable;
