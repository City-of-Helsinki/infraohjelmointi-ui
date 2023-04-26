// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningCell from './PlanningCell';
import PlanningHeader from './PlanningHeader';
import { IPlanningRow } from '@/interfaces/common';
import ProjectRow from './ProjectRow/ProjectRow';
import './styles.css';
import { IProject } from '@/interfaces/projectInterfaces';

const PlanningRow: FC<IPlanningRow> = (props) => {
  const { defaultExpanded, projectRows } = props;
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((cs: any, i: number) => (
          <PlanningCell sum={cs} position={i} {...props} key={i.toString()} />
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
