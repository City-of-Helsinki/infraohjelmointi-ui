import { useAppSelector } from '@/hooks/common';
import useProjectsList from '@/hooks/useProjectsList';
import { RootState } from '@/store';
import { FC, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocation } from 'react-router';
import PlanningProjectsTableGroupHeader from './PlanningProjectsTableGroupHeader';
import PlanningProjectsTableRow from './PlanningProjectsTableRow';
import PlanningClassTableRow from './PlanningClassTableRow';

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
          <tbody>
            {/* Master classes */}
            {masterClasses.map((mc) => (
              <PlanningClassTableRow key={mc.id} projectClass={mc} type="masterClass">
                {/* Classes */}
                {[...classes.filter((c) => c.parent === mc.id)].map((c) => (
                  <PlanningClassTableRow key={c.id} projectClass={c} type="class">
                    {/* Sub classes */}
                    {[...subClasses.filter((sc) => sc.parent === c.id)].map((sc) => (
                      <PlanningClassTableRow key={sc.id} projectClass={sc} type="subClass" />
                    ))}
                  </PlanningClassTableRow>
                ))}
              </PlanningClassTableRow>
            ))}
          </tbody>
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

/**
 *           <tbody>
            {masterClasses.map((mc) => (
              <>
                <PlanningClassTableRow
                  {...getPlanningProps(mc, 'masterClass')}
                  expanded={true}
                  handleClick={() => console.log('open classes')}
                />
                {[...classes.filter((c) => c.parent === mc.id)].map((c) => (
                  <>
                    <PlanningClassTableRow
                      {...getPlanningProps(c, 'class')}
                      expanded={true}
                      handleClick={() => console.log('open sub classes')}
                    />
                    {[...subClasses.filter((sc) => sc.parent === c.id)].map((sc) => (
                      <>
                        <PlanningClassTableRow
                          {...getPlanningProps(sc, 'subClass')}
                          // isOpen={true}
                          handleClick={() => console.log('open projects')}
                        />
                      </>
                    ))}
                  </>
                ))}
              </>
            ))}
          </tbody>
 */
