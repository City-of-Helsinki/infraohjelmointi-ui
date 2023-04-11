// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningClassesCell from './PlanningClassesCell';
import PlanningClassesHeader from './PlanningClassesHeader';
import { IPlanningTableRow } from '@/interfaces/common';
import './styles.css';

const PlanningClassesRow: FC<IPlanningTableRow> = (props) => {
  const { defaultExpanded } = props;

  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpand = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(defaultExpanded || false);
  }, [defaultExpanded]);

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
      {expanded && props.children.map((c) => <PlanningClassesRow {...c} />)}
    </>
  );
};

export default memo(PlanningClassesRow);
