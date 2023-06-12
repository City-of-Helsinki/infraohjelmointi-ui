// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHead from './PlanningHead';
import { IPlanningCell, IPlanningRow } from '@/interfaces/common';
import ProjectRow from './ProjectRow/ProjectRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/common';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { selectGroupsExpanded } from '@/reducers/planningSlice';
import _ from 'lodash';
import './styles.css';

interface IPlanningRowState {
  expanded: boolean;
  projects: Array<IProject>;
  searchedProjectId: string;
}

const PlanningRow: FC<IPlanningRow> = (props) => {
  const { defaultExpanded, projectRows, cells, id, type } = props;
  const projectToUpdate = useAppSelector(selectProjectUpdate)?.project;
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const { search } = useLocation();

  const [planningRowState, setPlanningRowState] = useState<IPlanningRowState>({
    expanded: defaultExpanded,
    projects: [],
    searchedProjectId: '',
  });

  const { expanded, projects, searchedProjectId } = planningRowState;

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
      const updatedProjects = projects.map((p) => {
        if (p.id === projectToUpdate.id) {
          inRow = true;
          return projectToUpdate;
        }
        return p;
      });
      // projectToUpdate does not already exist in this planning row if updatedProjects is the same
      // check if project belongs to this row type
      if (!inRow) {
        if (
          (type === 'group' &&
            projectToUpdate.projectGroup &&
            id === projectToUpdate.projectGroup) ||
          (!projectToUpdate.projectGroup &&
            (type === 'district' || type === 'division') &&
            id === projectToUpdate.projectLocation) ||
          (!projectToUpdate.projectLocation &&
            !projectToUpdate.projectGroup &&
            type.includes('class') &&
            id === projectToUpdate.projectClass)
        ) {
          updatedProjects.push(projectToUpdate);
        }
      }
      if (!_.isEqual(projects, updatedProjects)) {
        setPlanningRowState((current) => ({
          ...current,
          projects: updatedProjects,
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
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [searchedProjectId]);

  return (
    <>
      <tr className={props.type} data-testid={`row-${props.id}`}>
        <PlanningHead handleExpand={handleExpand} expanded={expanded} {...props} />
        {cells.map((c: IPlanningCell) => (
          <PlanningCell {...props} cell={c} key={c.key} />
        ))}
      </tr>

      {expanded && (
        <>
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} isSearched={p.id === searchedProjectId} />
          ))}
          {/* Render the rows recursively for each childRows */}
          {props.children.map((c) => (
            <PlanningRow {...c} />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningRow);
