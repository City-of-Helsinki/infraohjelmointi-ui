import useProjectCardsList from '@/hooks/useProjectCardsList';
import { FC, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import PlanningListProjectsTableHeader from './PlanningListProjectsTableHeader';
import PlanningListProjectsTableRow from './PlanningListProjectsTableRow';

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningListProjectsTable: FC<{ group: any }> = ({ group }: { group: any }) => {
  const { projectCards, fetchNext } = useProjectCardsList();

  const { ref, inView } = useInView();

  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = useCallback(
    () => setIsProjectsVisible((visibility) => !visibility),
    [setIsProjectsVisible],
  );

  // Fetch the next projects if the "fetch-projects-trigger" element comes into view
  useEffect(() => {
    if (inView && isProjectsVisible) {
      fetchNext();
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
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningListProjectsTable;
