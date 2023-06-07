// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo } from 'react';
import PlanningRow from './PlanningRow/PlanningRow';
import { IPlanningRow } from '@/interfaces/common';
import './styles.css';

interface IPlanningTableProps {
  rows: Array<IPlanningRow>;
  groupsExpanded: boolean;
}

const PlanningTable: FC<IPlanningTableProps> = ({ rows, groupsExpanded }) => {
  return (
    <table className="planning-table" cellSpacing={0}>
      <tbody>
        {/* Rows have a dynamic length, the PlanningRow component renders itself recursively */}
        {rows.map((row: IPlanningRow) => (
          <PlanningRow {...row} groupsExpanded={groupsExpanded} />
        ))}
      </tbody>
    </table>
  );
};

export default memo(PlanningTable);
