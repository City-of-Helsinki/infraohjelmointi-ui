import { FC, memo, useMemo } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectForcedToFrame, selectSelectedYears } from '@/reducers/planningSlice';
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
  const selectedYears = useAppSelector(selectSelectedYears);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const budgetCellColor = useMemo(() => {
    if (isCurrentYear && forcedToFrame) {
      return '!bg-brick';
    } else if (forcedToFrame) {
      return '!bg-brick-d';
    } else if (isCurrentYear) {
      return '!bg-bus';
    }
  }, [isCurrentYear, forcedToFrame]);

  return (
    <>
      <td className={`planned-budget-cell ${forcedToFrame ? 'framed' : ''}`}>
        <span data-testid={`summary-budget-${year}`}>{plannedBudget}</span>
      </td>
      {selectedYears.includes(year) && (
        <>
          {isCurrentYear && (
            <td
              key={`${year}-monthly-view`}
              className={`monthly-summary-cell summary-budget ${budgetCellColor}`}
            ></td>
          )}
          {moment.months().map((m) => {
            const hoverKey = `${year}-${m}`;
            return (
              <td
                key={hoverKey}
                className={`monthly-cell hoverable-${hoverKey} summary-budget ${budgetCellColor}`}
                onMouseOver={() => setHoveredClassToMonth(hoverKey)}
                onMouseLeave={() => removeHoveredClassFromMonth(hoverKey)}
              />
            );
          })}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTablePlannedBudgetCell);
