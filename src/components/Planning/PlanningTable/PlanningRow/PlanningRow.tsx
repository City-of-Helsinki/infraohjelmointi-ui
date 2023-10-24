// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHead from './PlanningHead';
import { IPlanningCell, IPlanningRow } from '@/interfaces/planningInterfaces';
import ProjectRow from './ProjectRow/ProjectRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { selectGroupsExpanded } from '@/reducers/planningSlice';
import _ from 'lodash';
import './styles.css';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

interface IPlanningRowState {
  expanded: boolean;
  projects: Array<IProject>;
  searchedProjectId: string;
}

const PlanningRow: FC<IPlanningRow & { sapCosts: Record<string, IProjectSapCost> }> = (props) => {
  const { defaultExpanded, projectRows, cells, id, type, sapCosts } = props;
  const projectToUpdate = useAppSelector(selectProjectUpdate)?.project;
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const { search } = useLocation();

  const [planningRowState, setPlanningRowState] = useState<IPlanningRowState>({
    expanded: defaultExpanded,
    projects: [],
    searchedProjectId: '',
  });

  const { expanded, projects, searchedProjectId } = planningRowState;

  /**
   * Adds the currently clicked items id to the search params, expand the row and navigate to the new URL
   */
  const handleExpand = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, expanded: !current.expanded }));
  }, []);

  // Set the rows initial expanded state
  useEffect(() => {
    setPlanningRowState((current) => ({ ...current, expanded: defaultExpanded || false }));
  }, [defaultExpanded]);

  // Set the projects to a local hook to be able to update it when the project-update event is triggered
  useEffect(() => {
    setPlanningRowState((current) => ({ ...current, projects: projectRows }));
  }, [projectRows]);

  useEffect(() => {
    if (type === 'group') {
      setPlanningRowState((current) => ({ ...current, expanded: groupsExpanded }));
    }
  }, [type, groupsExpanded]);

  // usePlanningRows-hook sets a projectToUpdate when the project-update event is triggered,
  // this useEffect updates the project in the view with the projecToUpdate
  useEffect(() => {
    if (projectToUpdate) {
      let inRow = false;
      let pIndex = -1;

      // If the project has become not-programmed then we filter it out and end the useEffect
      if (!projectToUpdate.programmed) {
        setPlanningRowState((current) => ({
          ...current,
          projects: current.projects.filter((p) => p.id !== projectToUpdate.id),
        }));
        return;
      }

      // We add the project returned by the project-update event to a new "updatedProjects" list
      const updatedProjects = projects.map((p, index) => {
        if (p.id === projectToUpdate.id) {
          inRow = true;
          pIndex = index;
          return projectToUpdate;
        }
        return p;
      });

      // projectToUpdate does not already exist in this planning row if updatedProjects is the same check if project belongs to this row type
      if (!inRow) {
        const isGroupsProject =
          type === 'group' && projectToUpdate.projectGroup && id === projectToUpdate.projectGroup;

        const isLocationsProject =
          !projectToUpdate.projectGroup &&
          (type === 'district' || type === 'division') &&
          id === projectToUpdate.projectLocation;

        const isClassesProject =
          !projectToUpdate.projectLocation &&
          !projectToUpdate.projectGroup &&
          type.toLowerCase().includes('class') &&
          id === projectToUpdate.projectClass;

        if (isGroupsProject || isLocationsProject || isClassesProject) {
          updatedProjects.push(projectToUpdate);
        }
      }
      // updated project is in the current planning row check if the update has caused it to be removed from the row
      else {
        if (
          (type === 'group' &&
            projects[pIndex].projectGroup === id &&
            !projectToUpdate.projectGroup) ||
          ((type === 'district' || type === 'division') &&
            projectToUpdate.projectGroup &&
            projects[pIndex].projectLocation === id) ||
          (type.toLowerCase().includes('class') &&
            projectToUpdate.projectGroup &&
            projectToUpdate.projectLocation &&
            projects[pIndex].projectClass === id)
        ) {
          updatedProjects.splice(pIndex, 1);
        }
      }
      // check if updated projects and projects are not equal and update the project currently displayed
      if (!_.isEqual(projects, updatedProjects)) {
        const sortedProjects = [...updatedProjects].sort((a, b) => a.name.localeCompare(b.name));
        setPlanningRowState((current) => ({
          ...current,
          projects: sortedProjects,
          expanded: true,
        }));
      }
    }
  }, [projectToUpdate]);

  const resetSearchedProjectId = useCallback(() => {
    setPlanningRowState((current) => ({ ...current, searchedProjectId: '' }));
  }, []);

  // Listens to the 'project' searchParam and sets the searchedProjectId and expanded to true if
  // the current row contains the project
  useEffect(() => {
    if (!search) {
      resetSearchedProjectId();
      return;
    }

    const projectId = new URLSearchParams(search).get('project');

    if (!projectId) {
      if (projectId !== searchedProjectId) {
        resetSearchedProjectId();
      }
      return;
    }

    const project = projectRows.filter((p) => p.id === projectId)[0];

    if (!project) {
      resetSearchedProjectId();
      return;
    }

    setPlanningRowState((current) => ({
      ...current,
      searchedProjectId: project.id,
      expanded: true,
    }));
  }, [search, projects]);

  // Listens to searchedProjectId and scrolls the viewport to the project
  useEffect(() => {
    if (!searchedProjectId) {
      return;
    }

    const element = document.getElementById(`project-row-${searchedProjectId}`);

    if (element) {
      console.log("heiiii")
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [searchedProjectId]);

  return (
    <>
      <tr className={props.type} data-testid={`row-${props.id}`}>
        <PlanningHead
          handleExpand={handleExpand}
          expanded={expanded}
          {...props}
          projectRows={projects}
        />
        {cells.map((c: IPlanningCell) => (
          <PlanningCell {...props} cell={c} key={c.key} />
        ))}
      </tr>

      {expanded && (
        <>
          {projects.map((p) => (
            <ProjectRow
              key={p.id}
              project={p}
              isSearched={p.id === searchedProjectId}
              parentId={id}
              sapCosts={sapCosts}
            />
          ))}
          {/* Render the rows recursively for each childRows */}
          {props.children.map((c) => (
            <PlanningRow {...c} sapCosts={sapCosts} />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningRow);
