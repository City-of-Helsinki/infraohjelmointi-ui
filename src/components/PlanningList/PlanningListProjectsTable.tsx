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

  const [isClassView, setIsClassView] = useState(false);

  const [headerState, setHeaderState] = useState({
    secondVisible: true,
    thirdVisible: true,
    fourthVisible: true,
    projectsVisible: true,
  });

  const { secondVisible, thirdVisible, fourthVisible, projectsVisible } = headerState;

  const handleFourthVisible = useCallback(
    () =>
      setHeaderState((currentState) => ({
        ...currentState,
        projectsVisible: !currentState.projectsVisible,
      })),
    [],
  );

  const handleThirdVisible = useCallback(
    () =>
      setHeaderState((currentState) => ({
        ...currentState,
        fourthVisible: !currentState.fourthVisible,
      })),
    [],
  );

  const handleSecondVisible = useCallback(
    () =>
      setHeaderState((currentState) => ({
        ...currentState,
        thirdVisible: !currentState.thirdVisible,
      })),
    [],
  );

  const handleFirstVisible = useCallback(
    () =>
      setHeaderState((currentState) => ({
        ...currentState,
        secondVisible: !currentState.secondVisible,
      })),
    [],
  );

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

  // Changes when clicking fourth row
  useEffect(() => {
    setHeaderState({ ...headerState, projectsVisible: fourthVisible });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fourthVisible]);

  // Changes when clicking third row
  useEffect(() => {
    if (!thirdVisible) {
      setHeaderState({ ...headerState, projectsVisible: false, fourthVisible: false });
    } else {
      setHeaderState({ ...headerState, projectsVisible: true, fourthVisible: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdVisible]);

  // Changes when clicking second row
  useEffect(() => {
    if (!secondVisible) {
      setHeaderState({
        ...headerState,
        projectsVisible: false,
        fourthVisible: false,
        thirdVisible: false,
      });
    } else {
      setHeaderState({
        ...headerState,
        projectsVisible: true,
        fourthVisible: true,
        thirdVisible: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondVisible]);

  // Fetch the next projects if the "fetch-projects-trigger" element comes into view
  useEffect(() => {
    if (inView && projectsVisible) {
      fetchNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const isCurrentRowVisible = (i: number) =>
    i === 3 ? fourthVisible : i === 2 ? thirdVisible : i === 1 ? secondVisible : true;

  const handleChangeRowVisibility = (i: number) =>
    i === 3
      ? handleFourthVisible
      : i === 2
      ? handleThirdVisible
      : i === 1
      ? handleSecondVisible
      : handleFirstVisible;

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
                isVisible={isCurrentRowVisible(i)}
                handleClick={handleChangeRowVisibility(i)}
              />
            ))
          ) : (
            <PlanningListProjectsTableGroupHeader
              group={group}
              isProjectsVisible={projectsVisible}
              handleProjectsVisible={handleProjectsVisible}
            />
          )}
        </thead>
        <tbody>
          {projectsVisible &&
            projects.map((p, i) => <PlanningListProjectsTableRow key={i} project={p} />)}
        </tbody>
      </table>
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningListProjectsTable;
