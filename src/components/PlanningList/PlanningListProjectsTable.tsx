import useProjectsList from '@/hooks/useProjectsList';
import { planListClasses } from '@/mocks/common';
import { FC, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocation } from 'react-router';
import PlanningListProjectsTableClassesHeader from './PlanningListProjectsTableClassesHeader';
import PlanningListProjectsTableGroupHeader from './PlanningListProjectsTableGroupHeader';
import PlanningListProjectsTableRow from './PlanningListProjectsTableRow';

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningListProjectsTable: FC<{ group: any }> = ({ group }: { group: any }) => {
  const { projects, fetchNext } = useProjectsList();
  const pathname = useLocation().pathname;

  const { ref, inView } = useInView();

  const [isProjectsVisible, setIsProjectsVisible] = useState(true);
  const [isClassView, setIsClassView] = useState(false);

  // Check if there is a need to change between planner / coordinator view
  useEffect(() => {
    if (pathname.includes('planner')) {
      setIsClassView(false);
    } else if (pathname.includes('coordinator')) {
      setIsClassView(true);
    }
  }, [pathname]);

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
          {isClassView ? (
            planListClasses.map((c, i) => (
              <PlanningListProjectsTableClassesHeader
                key={i}
                name={c.name}
                sums={c.sums}
                value={c.value}
                index={(i + 1).toString()}
              />
            ))
          ) : (
            <PlanningListProjectsTableGroupHeader
              group={group}
              isProjectsVisible={isProjectsVisible}
              handleProjectsVisible={handleProjectsVisible}
            />
          )}
        </thead>
        <tbody>
          {isProjectsVisible &&
            projects.map((p, i) => <PlanningListProjectsTableRow key={i} project={p} />)}
        </tbody>
      </table>
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningListProjectsTable;
