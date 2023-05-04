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

  const position = parseInt(key.split('year')[1]);
  const year = new Date().getFullYear() + position;

  const isGroup = type === 'group';

  return (
    <td className={`planning-cell ${type}`} data-testid={`cell-${id}-${year}`}>
      {/* Don't render sums for division */}
      {type !== 'division' && (
        <div className={`planning-cell-container`}>
          {/* Planned budget */}
          <span data-testid={`planned-budget-${id}-${year}`} className="planning-budget">
            {plannedBudget}
          </span>
          {/* Frame budget & Deviation between planned and frame budget */}
          {!isGroup && (
            <>
              <span data-testid={`frame-budget-${id}-${year}`}>{frameBudget}</span>
              {deviation !== undefined && (
                <span data-testid={`deviation-${id}-${year}`} className="planning-cell-deviation">
                  {deviation.value}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </td>
  );
};

export default memo(PlanningCell);
