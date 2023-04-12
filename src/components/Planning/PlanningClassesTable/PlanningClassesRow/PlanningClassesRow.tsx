// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningClassesCell from './PlanningClassesCell';
import PlanningClassesHeader from './PlanningClassesHeader';
import { IPlanningTableRow } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProject } from '@/services/projectServices';
import './styles.css';
import PlanningGroupsTableRow from '../../PlanningGroupsTable/PlanningGroupsTableRow';

const PlanningClassesRow: FC<IPlanningTableRow> = (props) => {
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

  const handleOnProjectMenuClick = () => console.log('click');

  return (
    <>
      <tr className={props.type}>
        <PlanningClassesHeader handleExpand={handleExpand} expanded={expanded} {...props} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((cs: any, i: number) => (
          <PlanningClassesCell sum={cs} position={i} {...props} key={i.toString()} />
        ))}
      </tr>
      {/* Render the rows recursively for each childRows */}
      {expanded && (
        <>
          {props.children.map((c) => (
            <PlanningClassesRow {...c} />
          ))}
          {projects.map((p, i) => (
            <PlanningGroupsTableRow
              key={i}
              project={p}
              onProjectMenuClick={handleOnProjectMenuClick}
            />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningClassesRow);
