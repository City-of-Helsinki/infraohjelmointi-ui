import { FC, memo } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectSelectedYear } from '@/reducers/planningSlice';
import moment from 'moment';
import './styles.css';

interface IPlanningSummaryTablePlannedBudgetCellProps {
  year: number;
  plannedBudget?: string;
  isCurrentYear: boolean;
}

const PlanningSummaryTablePlannedBudgetCell: FC<IPlanningSummaryTablePlannedBudgetCellProps> = ({
  year,
  plannedBudget,
  isCurrentYear,
}) => {
  const selectedYear = useAppSelector(selectSelectedYear);
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
