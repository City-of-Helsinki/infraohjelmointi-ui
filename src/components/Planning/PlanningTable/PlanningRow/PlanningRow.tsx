// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import PlanningCell from './PlanningCell';
import PlanningHeader from './PlanningHeader';
import { IPlanningCell, IPlanningRow } from '@/interfaces/common';
import ProjectRow from './ProjectRow/ProjectRow';
import './styles.css';
import { IProject } from '@/interfaces/projectInterfaces';

const PlanningRow: FC<IPlanningRow> = (props) => {
  const { defaultExpanded, projectRows, cells } = props;
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

  const onUpdateProject = useCallback(
    (projectToUpdate: IProject) => {
      const updatedProjects = projects.map((p) =>
        p.id === projectToUpdate.id ? projectToUpdate : p,
      );
      setProjects(updatedProjects);
    },
    [projects],
  );

  return (
    <>
      <tr className={props.type} data-testid={`row-${props.id}`}>
        <PlanningHeader handleExpand={handleExpand} expanded={expanded} {...props} />
        {cells.map((c: IPlanningCell) => (
          <PlanningCell {...props} cell={c} key={c.key} />
        ))}
      </tr>

      {expanded && (
        <>
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} onUpdateProject={onUpdateProject} />
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
