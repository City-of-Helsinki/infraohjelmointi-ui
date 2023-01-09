import { useAppSelector } from '@/hooks/common';
import useProjectsList from '@/hooks/useProjectsList';
import { classSums, classValue } from '@/mocks/common';
import { RootState } from '@/store';
import { FC, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocation } from 'react-router';
import PlanningClassTableRow from './PlanningClassTableRow';
import PlanningProjectsTableGroupHeader from './PlanningProjectsTableGroupHeader';
import PlanningProjectsTableRow from './PlanningProjectsTableRow';

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningProjectsTable: FC<{ group: any }> = ({ group }: { group: any }) => {
  const { projects, fetchNext } = useProjectsList();
  const pathname = useLocation().pathname;

  const masterClasses = useAppSelector((state: RootState) => state.class.masterClasses);
  const classes = useAppSelector((state: RootState) => state.class.classes);
  const subClasses = useAppSelector((state: RootState) => state.class.subClasses);

  const { ref, inView } = useInView();

  const [isClassView, setIsClassView] = useState(false);

  const [headerState, setHeaderState] = useState({
    projectsVisible: true,
  });

  const { projectsVisible } = headerState;

  const handleProjectsVisible = useCallback(
    () =>
      setHeaderState((currentState) => ({
        ...currentState,
        projectsVisible: !currentState.projectsVisible,
      })),
    [],
  );

  // Check if there is a need to change between planner / coordinator view
  useEffect(() => {
    if (pathname.includes('planner')) {
      setIsClassView(false);
    } else if (pathname.includes('coordinator')) {
      setIsClassView(true);
    }
  }, [pathname]);

  // Fetch the next projects if the "fetch-projects-trigger" element comes into view
  useEffect(() => {
    if (inView && projectsVisible) {
      fetchNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <>
      <table className="planning-projects-table" cellSpacing={0}>
        {isClassView ? (
          <thead>
            {masterClasses.map((mc) => (
              <>
                <PlanningClassTableRow
                  key={mc.id}
                  name={mc.name}
                  sums={classSums}
                  value={classValue}
                  isVisible={true}
                  type="masterClass"
                  handleClick={() => console.log('click')}
                />
                {[...classes.filter((c) => c.parent === mc.id)].map((c) => (
                  <>
                    <PlanningClassTableRow
                      key={c.id}
                      name={c.name}
                      sums={classSums}
                      value={classValue}
                      isVisible={true}
                      type="class"
                      handleClick={() => console.log('click')}
                    />
                    {[...subClasses.filter((sc) => sc.parent === c.id)].map((sc) => (
                      <>
                        <PlanningClassTableRow
                          key={sc.id}
                          name={sc.name}
                          sums={classSums}
                          value={classValue}
                          isVisible={true}
                          type="subClass"
                          handleClick={() => console.log('click')}
                        />
                      </>
                    ))}
                  </>
                ))}
              </>
            ))}
          </thead>
        ) : (
          <>
            {/* GROUP VIEW */}
            <thead>
              <PlanningProjectsTableGroupHeader
                group={group}
                isProjectsVisible={projectsVisible}
                handleProjectsVisible={handleProjectsVisible}
              />
            </thead>
            <tbody>
              {projectsVisible &&
                projects.map((p, i) => <PlanningProjectsTableRow key={i} project={p} />)}
            </tbody>
          </>
        )}
      </table>
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningProjectsTable;
