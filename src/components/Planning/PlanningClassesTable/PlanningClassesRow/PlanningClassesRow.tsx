import { FC, memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { classSums } from '@/mocks/common';
import PlanningClassesCell from './PlanningClassesCell';
import PlanningClassesHeader from './PlanningClassesHeader';
import { PlanningTableRowType } from '@/hooks/usePlanningTableRows';
import './styles.css';

interface IPlanningClassesRowProps {
  id: string;
  name: string;
  type: PlanningTableRowType;
  children?: ReactNode;
  defaultExpanded: boolean;
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
          <PlanningClassesCell key={i} sum={cs} position={i} {...props} />
        ))}
      </tr>
      {expanded && children}
    </>
  );
};

export default memo(PlanningClassesRow);
