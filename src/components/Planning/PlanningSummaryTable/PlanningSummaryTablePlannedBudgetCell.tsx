import { FC, memo, useMemo } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectForcedToFrame, selectSelectedYear } from '@/reducers/planningSlice';
import moment from 'moment';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
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
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const budgetCellColor = useMemo(() => {
    if (isCurrentYear && forcedToFrame) {
      return '!bg-brick';
    } else if (isCurrentYear) {
      return '!bg-bus';
    }
  }, [isCurrentYear, forcedToFrame]);

  return (
    <>
      <td className={`planned-budget-cell ${forcedToFrame ? 'framed' : ''}`}>
        <span data-testid={`summary-budget-${year}`}>{plannedBudget}</span>
      </td>
      {year === selectedYear && (
        <>
          {isCurrentYear && (
            <td
              key={`${year}-monthly-view`}
              className={`monthly-summary-cell summary-budget ${budgetCellColor}`}
            ></td>
          )}
          {moment.months().map((m) => (
            <td
              key={m}
              className={`monthly-cell hoverable-${m} summary-budget ${budgetCellColor}`}
              onMouseOver={() => setHoveredClassToMonth(m)}
              onMouseLeave={() => removeHoveredClassFromMonth(m)}
            />
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTablePlannedBudgetCell);
