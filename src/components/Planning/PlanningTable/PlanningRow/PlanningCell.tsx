import { FC, memo } from 'react';
import { IPlanningCell, IPlanningRow, PlanningRowType } from '@/interfaces/common';
import './styles.css';

interface IPlanningCellProps extends IPlanningRow {
  cell: IPlanningCell;
  type: PlanningRowType;
  id: string;
  selectedYear: number | null;
}

const months = ['tam', 'hel', 'maa', 'huh', 'tou', 'kes', 'hei', 'elo', 'syy', 'lok', 'mar', 'jou'];

const PlanningCell: FC<IPlanningCellProps> = ({ type, id, cell, selectedYear }) => {
  const { plannedBudget, frameBudget, deviation, year, isFirstYear } = cell;

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
        <>
          {isFirstYear && (
            <td key={`${year}-monthly-cell`} className={`monthly-summary-cell ${type}`}>
              {/* TODO: some stuff here */}
            </td>
          )}
          {months.map((m) => (
            <td key={m} className={`monthly-cell ${type}`}>
              {/* TODO: some stuff here */}
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningCell);
