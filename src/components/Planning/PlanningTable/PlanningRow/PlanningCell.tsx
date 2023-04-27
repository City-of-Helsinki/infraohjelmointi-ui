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
      {/* temporarily hide mock values if it's a subdivision */}
      {type !== 'division' && (
        <div className={`planning-cell-container`}>
          {plannedBudget !== undefined && (
            <span data-testid={`budget-${id}-${year}`} className="planning-budget">
              {plannedBudget}
            </span>
          )}
          <span data-testid={`realized-${id}-${year}`}>{frameBudget}</span>
          {deviation !== undefined && (
            <span data-testid={`deviation-${id}-${year}`} className="planning-deviation">
              {deviation}
            </span>
          )}
        </div>
      )}
    </td>
  );
};

export default memo(PlanningCell);
