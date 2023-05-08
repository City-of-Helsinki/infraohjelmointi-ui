import { FC, memo } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/common';
import './styles.css';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell }) => {
  const { plannedBudget, frameBudget, deviation, key } = cell;

  const cellPosition = parseInt(key.split('year')[1]);
  const year = new Date().getFullYear() + cellPosition;

  return (
    <td className={`planning-cell ${type}`} data-testid={`cell-${id}-${year}`}>
      <div className={`planning-cell-container`}>
        <span data-testid={`planned-budget-${id}-${year}`} className="planning-budget">
          {plannedBudget}
        </span>
        <span data-testid={`frame-budget-${id}-${year}`}>{frameBudget}</span>
        <span data-testid={`deviation-${id}-${year}`} className="planning-cell-deviation">
          {deviation}
        </span>
      </div>
    </td>
  );
};

export default memo(PlanningCell);
