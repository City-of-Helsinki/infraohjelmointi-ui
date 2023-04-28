// import { BubbleIcon } from '../../../shared';
import { FC, memo } from 'react';
import './styles.css';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/common';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell }) => {
  const { plannedBudget, frameBudget, deviation, key } = cell;

  const position = parseInt(key.split('year')[1]);
  const year = new Date().getFullYear() + position;

  return (
    <td className={`planning-cell ${type}`} data-testid={`cell-${id}-${year}`}>
      {/* Don't render sums for division */}
      {type !== 'division' && (
        <div className={`planning-cell-container`}>
          {/* Planned budget */}
          {plannedBudget !== undefined && (
            <span data-testid={`planned-budget-${id}-${year}`} className="planning-budget">
              {plannedBudget}
            </span>
          )}
          {/* Frame budget */}
          <span data-testid={`frame-budget-${id}-${year}`}>{frameBudget}</span>
          {/* Deviation between planned and frame budget */}
          {deviation !== undefined && (
            <span
              data-testid={`deviation-${id}-${year}`}
              className={`planning-cell-deviation ${
                deviation.isNegative ? 'negative' : ''
              } ${type}`}
            >
              {deviation.value}
            </span>
          )}
        </div>
      )}
    </td>
  );
};

export default memo(PlanningCell);
