// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningCell from './PlanningCell';
import PlanningHeader from './PlanningHeader';
import { IPlanningTableRow } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProject } from '@/services/projectServices';
import ProjectRow from './ProjectRow/ProjectRow';
import './styles.css';

const PlanningRow: FC<IPlanningTableRow> = (props) => {
  const { defaultExpanded, type } = props;
  const [projects, setProjects] = useState<Array<IProject>>([]);
  const [fetchingProjects, setFetchingProjects] = useState(false);

  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpand = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(defaultExpanded || false);
  }, [defaultExpanded]);

  // If the row is expanded and type is correct, fetch the projects for that row
  useEffect(() => {
    if (
      !fetchingProjects &&
      expanded &&
      (type === 'class' ||
        type === 'subClass' ||
        type === 'division' ||
        type === 'group' ||
        type === 'district')
    ) {
      const fetchProjectsByRelation = async () => {
        setFetchingProjects(true);
        try {
          const project = await getProject('ffced10b-7918-4332-8bb7-adda827a92c4/');
          setProjects([project]);
          setFetchingProjects(false);
        } catch (e) {
          setFetchingProjects(false);
        }
      };
      // call the function
      fetchProjectsByRelation();
    }
  }, [expanded]);

  return (
    <>
      <tr className={props.type}>
        <PlanningHeader handleExpand={handleExpand} expanded={expanded} {...props} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((cs: any, i: number) => (
          <PlanningCell sum={cs} position={i} {...props} key={i.toString()} />
        ))}
      </tr>

      {expanded && (
        <>
          {/* Render the rows recursively for each childRows */}
          {props.children.map((c) => (
            <PlanningRow {...c} />
          ))}
          {projects.map((p, i) => (
            <ProjectRow key={i} project={p} />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningRow);
