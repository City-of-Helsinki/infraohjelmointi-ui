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
  initiallyExpanded?: true;
}

const PlanningClassesRow: FC<IPlanningClassesRowProps> = (props) => {
  const { initiallyExpanded, children } = props;

  const [expanded, setExpanded] = useState(initiallyExpanded || false);

  const handleExpand = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    setExpanded(initiallyExpanded || false);
  }, [initiallyExpanded]);

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
