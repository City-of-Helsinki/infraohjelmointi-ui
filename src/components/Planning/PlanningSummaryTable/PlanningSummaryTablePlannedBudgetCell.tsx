import { FC, memo } from 'react';
import './styles.css';

interface IPlanningSummaryTablePlannedBudgetCellProps {
  year: number;
  plannedBudget?: string;
  selectedYear: number | null;
  isFirstYear: boolean;
}

const months = ['tam', 'hel', 'maa', 'huh', 'tou', 'kes', 'hei', 'elo', 'syy', 'lok', 'mar', 'jou'];

const PlanningSummaryTablePlannedBudgetCell: FC<IPlanningSummaryTablePlannedBudgetCellProps> = ({
  year,
  plannedBudget,
  selectedYear,
  isFirstYear,
}) => {
  return (
    <>
      <td className="planned-budget-cell">
        <span data-testid={`summary-budget-${year}`}>{plannedBudget}</span>
      </td>
      {year === selectedYear && (
        <>
          {isFirstYear && (
            <td
              key={`${year}-monthly-view`}
              className={`monthly-summary-cell summary-budget ${isFirstYear ? 'first-year' : ''}`}
            ></td>
          )}
          {months.map((m) => (
            <td
              key={m}
              className={`monthly-cell summary-budget ${isFirstYear ? 'first-year' : ''}`}
            ></td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTablePlannedBudgetCell);
