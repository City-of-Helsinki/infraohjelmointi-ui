// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { memo } from 'react';
import PlanningRow from './PlanningRow/PlanningRow';
import { IPlanningRow } from '@/interfaces/common';
import { useAppSelector } from '@/hooks/common';
import { selectPlanningRows } from '@/reducers/planningSlice';
import './styles.css';

const PlanningTable = () => {
  const rows = useAppSelector(selectPlanningRows);
  return (
    <table className="planning-table" cellSpacing={0}>
      <tbody>
        {/* Rows have a dynamic length, the PlanningRow component renders itself recursively */}
        {rows.map((row: IPlanningRow) => (
          <PlanningRow {...row} />
        ))}
      </tbody>
    </table>
  );
};

export default memo(PlanningTable);
