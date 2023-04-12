import useProjectsList from '@/hooks/useProjectsList';
import { planGroups } from '@/mocks/common';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import PlanningGroupsTableGroupHeader from './PlanningGroupsTableHeader';
import PlanningGroupsTableRow from './PlanningGroupsTableRow';
import _ from 'lodash';
import './styles.css';

const PlanningGroupsTable = () => {
  const { projects, fetchNext } = useProjectsList();
  const { ref, inView } = useInView();
  const [tableState, setTableState] = useState<{
    projectsVisible: boolean;
  }>({
    projectsVisible: true,
  });

  const { projectsVisible } = tableState;

  const handleProjectsVisible = useCallback(
    () => setTableState((current) => ({ ...current, projectsVisible: !current.projectsVisible })),
    [],
  );

  // Fetch the next projects if the "fetch-projects-trigger" element comes into view
  useEffect(() => {
    if (inView && projectsVisible) {
      fetchNext();
    }
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
            projects.map((p, i) => <PlanningGroupsTableRow key={i} project={p} />)}
        </tbody>
      </table>
      <div data-testid="fetch-projects-trigger" ref={ref} />
    </>
  );
};

export default PlanningGroupsTable;
