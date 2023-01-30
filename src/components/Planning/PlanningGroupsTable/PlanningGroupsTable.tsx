import useProjectsList from '@/hooks/useProjectsList';
import { planGroups } from '@/mocks/common';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import PlanningGroupsTableGroupHeader from './PlanningGroupsTableHeader';
import PlanningGroupsTableRow from './PlanningGroupsTableRow';
import './styles.css';

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningGroupsTable = () => {
  const { projects, fetchNext } = useProjectsList();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const toggleStatusDialog = useCallback(() => setShowStatusDialog((current) => !current), []);

  const { ref, inView } = useInView();

  const [projectsVisible, setProjectsVisible] = useState(true);

  const handleProjectsVisible = useCallback(
    () => setProjectsVisible((currentState) => !currentState),
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
                showStatusDialog={showStatusDialog}
                toggleStatusDialog={toggleStatusDialog}
              />
            ))}
        </tbody>
      </table>
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningGroupsTable;
