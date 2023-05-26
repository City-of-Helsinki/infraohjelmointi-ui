import { FC, memo } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/common';
import './styles.css';
import moment from 'moment';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
  selectedYear: number | null;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell, selectedYear }) => {
  const { plannedBudget, frameBudget, deviation, year, isCurrentYear } = cell;

  return (
    <>
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
      {/* There will be data generated here (at least for the first year) in future tasks */}
      {year === selectedYear && (
        <>
          {isCurrentYear && (
            <td key={`${year}-monthly-cell`} className={`monthly-summary-cell ${type}`}></td>
          )}
          {moment.monthsShort().map((m) => (
            <td key={m} className={`monthly-cell ${type}`}></td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningCell);
