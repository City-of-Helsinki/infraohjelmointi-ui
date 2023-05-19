// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHead from './PlanningHead';
import { IPlanningCell, IPlanningRow } from '@/interfaces/common';
import ProjectRow from './ProjectRow/ProjectRow';
import { IProject } from '@/interfaces/projectInterfaces';
import { useLocation } from 'react-router';
import _ from 'lodash';
import './styles.css';

interface IPlanningRowState {
  expanded: boolean;
  projects: Array<IProject>;
  searchedProjectId: string;
}

interface IPlanningRowProps extends IPlanningRow {
  projectToUpdate: IProject | null;
}

const PlanningRow: FC<IPlanningRowProps> = (props) => {
  const { defaultExpanded, projectRows, cells, projectToUpdate } = props;

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

  // usePlanningRows-hook sets a projectToUpdate when the project-update event is triggered,
  // this useEffect updates the project in the view with the projecToUpdate
  useEffect(() => {
    if (projectToUpdate) {
      const updatedProjects = projects.map((p) =>
        p.id === projectToUpdate.id ? projectToUpdate : p,
      );
      if (!_.isEqual(projects, updatedProjects)) {
        setPlanningRowState((current) => ({ ...current, projects: updatedProjects }));
      }
    }
  }, [projectToUpdate]);

  // Listens to the 'project' searchParam and sets the searchedProjectId and expanded to true if
  // the current row contains the project
  useEffect(() => {
    if (!search) {
      return;
    }

    const projectId = new URLSearchParams(search).get('project');

    if (!projectId) {
      return;
    }

    const project = projectRows.filter((p) => p.id === projectId)[0];

    if (!project) {
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
            <PlanningRow {...c} projectToUpdate={projectToUpdate} />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningRow);
