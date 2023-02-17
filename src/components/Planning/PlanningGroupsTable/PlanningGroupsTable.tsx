import { useAppDispatch, useAppSelector } from '@/hooks/common';
import useProjectsList from '@/hooks/useProjectsList';
import { planGroups } from '@/mocks/common';
import { getProjectPhasesThunk, selectPhaseList } from '@/reducers/listsSlice';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { PhaseDialog } from '../PhaseDialog';
import PlanningGroupsTableGroupHeader from './PlanningGroupsTableHeader';
import PlanningGroupsTableRow from './PlanningGroupsTableRow';
import './styles.css';

const PlanningGroupsTable = () => {
  const { projects, fetchNext } = useProjectsList();
  const { ref, inView } = useInView();
  const dispatch = useAppDispatch();
  const phases = useAppSelector(selectPhaseList);
  const [tableState, setTableState] = useState<{
    selectedProjectId: string;
    projectsVisible: boolean;
    atElement: Element;
  }>({
    selectedProjectId: '',
    projectsVisible: true,
    atElement: null as unknown as Element,
  });

  const projectsMap = useMemo(() => _.keyBy(projects, 'id'), [projects]);

  const { projectsVisible, selectedProjectId, atElement } = tableState;

  // Set the selectedPhaseDialog to the project name
  const handleOnProjectMenuClick = useCallback((projectId: string, e: MouseEvent) => {
    setTableState((current) => ({
      ...current,
      selectedProjectId: projectId,
      atElement: e.target as unknown as Element,
    }));
  }, []);

  // Clear the projectName from the selectedPhaseDialog
  const handleClosePhaseDialog = useCallback(
    () => setTableState((current) => ({ ...current, selectedProjectId: '' })),
    [],
  );

  const handleProjectsVisible = useCallback(
    () => setTableState((current) => ({ ...current, projectsVisible: !current.projectsVisible })),
    [],
  );

  // Fetch the next projects if the "fetch-projects-trigger" element comes into view
  useEffect(() => {
    if (inView && projectsVisible) {
      fetchNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Get phases list
  useEffect(() => {
    dispatch(getProjectPhasesThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <table className="planning-table" cellSpacing={0}>
        {/* GROUP VIEW */}
        <PlanningGroupsTableGroupHeader
          group={planGroups[0]}
          isProjectsVisible={projectsVisible}
          handleProjectsVisible={handleProjectsVisible}
        />
        <tbody>
          {projectsVisible &&
            projects.map((p, i) => (
              <PlanningGroupsTableRow
                key={i}
                project={p}
                onProjectMenuClick={handleOnProjectMenuClick}
              />
            ))}
        </tbody>
      </table>
      {selectedProjectId && (
        <PhaseDialog
          close={handleClosePhaseDialog}
          phases={phases}
          project={projectsMap[selectedProjectId]}
          atElement={atElement as unknown as Element}
        />
      )}
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningGroupsTable;
