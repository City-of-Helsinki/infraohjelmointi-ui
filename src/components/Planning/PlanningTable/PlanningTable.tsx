// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { memo } from 'react';
import PlanningRow from './PlanningRow/PlanningRow';
import { IPlanningRow } from '@/interfaces/common';
import { useAppSelector } from '@/hooks/common';
import { selectMode, selectPlanningRows } from '@/reducers/planningSlice';
import './styles.css';

const PlanningTable = () => {
  const rows = useAppSelector(selectPlanningRows);
  const mode = useAppSelector(selectMode);
  return (
    <div className="planning-table-container" id="planning-table-container">
      <table className={`planning-table ${mode}`} cellSpacing={0} data-testid="planning-table">
        <tbody>
          {/* Rows have a dynamic length, the PlanningRow component renders itself recursively */}
          {rows.map((row: IPlanningRow) => (
            <PlanningRow {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(PlanningTable);
