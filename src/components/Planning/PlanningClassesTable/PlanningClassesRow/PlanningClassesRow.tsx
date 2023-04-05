// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningClassesCell from './PlanningClassesCell';
import PlanningClassesHeader from './PlanningClassesHeader';
import './styles.css';
import { IPlanningTableRow } from '@/interfaces/common';

interface IPlanningClassesRowProps extends IPlanningTableRow {
  children?: ReactNode;
}

const PlanningClassesRow: FC<IPlanningClassesRowProps> = (props) => {
  const { defaultExpanded, children } = props;

  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpand = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(defaultExpanded || false);
  }, [defaultExpanded]);

  return (
    <>
      <tr>
        <PlanningClassesHeader handleExpand={handleExpand} expanded={expanded} {...props} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {classSums.map((cs: any, i: number) => (
          <PlanningClassesCell sum={cs} position={i} {...props} />
        ))}
      </tr>
      {expanded && children}
    </>
  );
};

export default memo(PlanningClassesRow);
