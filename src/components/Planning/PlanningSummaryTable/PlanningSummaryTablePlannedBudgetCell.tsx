import { FC, memo } from 'react';
import './styles.css';

interface IPlanningSummaryTablePlannedBudgetCellProps {
  year: number;
  plannedBudget?: string;
  selectedYear: number | null;
}

const PlanningSummaryTablePlannedBudgetCell: FC<IPlanningSummaryTablePlannedBudgetCellProps> = ({
  year,
  plannedBudget,
  selectedYear,
}) => {
  return (
    <>
      <td className="planned-budget-cell">
        <span data-testid={`summary-budget-${year}`}>{plannedBudget}</span>
      </td>
      {year === selectedYear && (
        <td key={`${year}-monthly-view`} className="!min-w-[500px]">
          <span className="!text-left text-sm font-light">{'Monthly view cell'}</span>
        </td>
      )}
    </>
  );
};

export default memo(PlanningSummaryTablePlannedBudgetCell);
