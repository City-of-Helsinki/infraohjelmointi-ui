import useProjectsList from '@/hooks/useProjectsList';
import { planGroups } from '@/mocks/common';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import PlanningGroupsTableGroupHeader from './PlanningGroupsTableHeader';
import PlanningGroupsTableRow from './PlanningGroupsTableRow';
import './styles.css';

const PlanningGroupsTable = () => {
  const { projects, fetchNext } = useProjectsList();
  const { ref, inView } = useInView();
  const [tableState, setTableState] = useState({
    selectedStatusDialog: '',
    projectsVisible: true,
  });

  const { selectedStatusDialog, projectsVisible } = tableState;

  // Set the selectedStatusDialog to the project name
  const handleSelectStatusDialog = useCallback(
    (projectName: string) =>
      setTableState((current) => ({ ...current, selectedStatusDialog: projectName })),
    [],
  );

  // Clear the projectName from the selectedStatusDialog
  const handleCloseStatusDialog = useCallback(
    () => setTableState((current) => ({ ...current, selectedStatusDialog: '' })),
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
                selectedDialog={selectedStatusDialog}
                selectStatusDialog={handleSelectStatusDialog}
                closeStatusDialog={handleCloseStatusDialog}
              />
            ))}
        </tbody>
      </table>
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningGroupsTable;
