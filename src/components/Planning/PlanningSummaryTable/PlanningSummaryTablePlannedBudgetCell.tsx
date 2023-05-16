import { FC, memo } from 'react';
import './styles.css';
import moment from 'moment';

interface IPlanningSummaryTablePlannedBudgetCellProps {
  year: number;
  plannedBudget?: string;
  selectedYear: number | null;
  isStartMonth: boolean;
}

const PlanningSummaryTablePlannedBudgetCell: FC<IPlanningSummaryTablePlannedBudgetCellProps> = ({
  year,
  plannedBudget,
  selectedYear,
  isStartMonth,
}) => {
  return (
    <>
      <td className="planned-budget-cell">
        <span data-testid={`summary-budget-${year}`}>{plannedBudget}</span>
      </td>
      {year === selectedYear && (
        <>
          {isStartMonth && (
            <td
              key={`${year}-monthly-view`}
              className={`monthly-summary-cell summary-budget ${isStartMonth ? 'start-month' : ''}`}
            ></td>
          )}
          {moment.monthsShort().map((m) => (
            <td
              key={m}
              className={`monthly-cell summary-budget ${isStartMonth ? 'start-month' : ''}`}
            ></td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTablePlannedBudgetCell);
