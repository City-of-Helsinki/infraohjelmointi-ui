// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHead from './PlanningHead';
import { IPlanningCell, IPlanningRow } from '@/interfaces/common';
import ProjectRow from './ProjectRow/ProjectRow';
import { IProject } from '@/interfaces/projectInterfaces';
import './styles.css';
import _ from 'lodash';

interface IPlanningRowProps extends IPlanningRow {
  projectToUpdate: IProject | null;
}

const PlanningRow: FC<IPlanningRowProps> = (props) => {
  const { defaultExpanded, projectRows, cells, projectToUpdate } = props;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [projects, setProjects] = useState<Array<IProject>>([]);

  const handleExpand = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(defaultExpanded || false);
  }, [defaultExpanded]);

  useEffect(() => {
    setProjects(projectRows);
  }, [projectRows]);

  useEffect(() => {
    if (projectToUpdate) {
      const updatedProjects = projects.map((p) =>
        p.id === projectToUpdate.id ? projectToUpdate : p,
      );
      if (!_.isEqual(projects, updatedProjects)) {
        setProjects(updatedProjects);
      }
    }
  }, [projectToUpdate]);

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
            <ProjectRow key={p.id} project={p} />
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
