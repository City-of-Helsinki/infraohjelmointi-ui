import { FC, memo } from 'react';
import './styles.css';
import moment from 'moment';

interface IPlanningSummaryTablePlannedBudgetCellProps {
  year: number;
  plannedBudget?: string;
  selectedYear: number | null;
  isCurrentYear: boolean;
}

const PlanningSummaryTablePlannedBudgetCell: FC<IPlanningSummaryTablePlannedBudgetCellProps> = ({
  year,
  plannedBudget,
  selectedYear,
  isCurrentYear,
}) => {
  return (
    <>
      <td className="planned-budget-cell">
        <span data-testid={`summary-budget-${year}`}>{plannedBudget}</span>
      </td>
      {year === selectedYear && (
        <>
          {isCurrentYear && (
            <td
              key={`${year}-monthly-view`}
              className={`monthly-summary-cell summary-budget ${isCurrentYear ? '!bg-bus' : ''}`}
            ></td>
          )}
          {moment.monthsShort().map((m) => (
            <td
              key={m}
              className={`monthly-cell summary-budget ${isCurrentYear ? '!bg-bus' : ''}`}
            ></td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTablePlannedBudgetCell);
