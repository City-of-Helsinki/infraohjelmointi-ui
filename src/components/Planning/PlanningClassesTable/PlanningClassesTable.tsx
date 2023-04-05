// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo } from 'react';
import PlanningClassesRow from './PlanningClassesRow/PlanningClassesRow';
import { IPlanningTableRow } from '@/interfaces/common';
import './styles.css';

interface IPlanningClassesTableProps {
  rows: Array<IPlanningTableRow>;
}

const PlanningClassesTable: FC<IPlanningClassesTableProps> = ({ rows }) => {
  return (
    <table className="planning-table" cellSpacing={0}>
      <tbody>
        {/* Rows have a dynamic length, the PlanningClassesRow component renders itself recursively */}
        {rows.map((row: IPlanningTableRow) => (
          <PlanningClassesRow {...row} />
        ))}
      </tbody>
    </table>
  );
};

export default memo(PlanningClassesTable);
