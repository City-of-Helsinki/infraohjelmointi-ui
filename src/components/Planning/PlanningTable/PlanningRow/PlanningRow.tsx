// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningCell from './PlanningCell';
import PlanningHeader from './PlanningHeader';
import { IPlanningRow } from '@/interfaces/common';
import ProjectRow from './ProjectRow/ProjectRow';
import './styles.css';

const PlanningRow: FC<IPlanningRow> = (props) => {
  const { defaultExpanded, projects } = props;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpand = useCallback(() => {
    // console.log('Expanded: ', props.name, ' with id: ', props.id);
    // console.log('And children: ', props.children);

    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(defaultExpanded || false);
  }, [defaultExpanded]);

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
          {projects.map((p, i) => (
            <ProjectRow key={i} project={p} />
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
