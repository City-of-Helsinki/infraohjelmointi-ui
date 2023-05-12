import { FC, memo } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/common';
import './styles.css';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
  selectedYear: number | null;
}

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell, selectedYear }) => {
  const { plannedBudget, frameBudget, deviation, year } = cell;

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
      {year === selectedYear && (
        <td key={`${year}-monthly-view`} className="!min-w-[500px]">
          <span className="text-sm font-light">{'Monthly view cell'}</span>
        </td>
      )}
    </>
  );
};

export default memo(PlanningCell);
