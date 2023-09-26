import { FC, memo } from 'react';
import { formattedNumberToNumber } from '@/utils/calculations';
import { useAppSelector } from '@/hooks/common';
import { selectSelectedYear } from '@/reducers/planningSlice';
import moment from 'moment';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
import './styles.css';

interface IPlanningSummaryTableRealizedBudgetCellProps {
  frameBudget?: string;
  deviation?: string;
  year: number;
  isCurrentYear: boolean;
}

const PlanningSummaryTableRealizedBudgetCell: FC<IPlanningSummaryTableRealizedBudgetCellProps> = ({
  frameBudget,
  deviation,
  year,
  isCurrentYear,
}) => {
  const selectedYear = useAppSelector(selectSelectedYear);
  return (
    <>
      <td className="planning-summary-frame-and-deviation-cell">
        <div className="planning-summary-frame-and-deviation-container">
          <span className="frame-budget" data-testid={`summary-frame-${year}`}>
            {frameBudget}
          </span>
          <span
            className={`deviation ${
              deviation && formattedNumberToNumber(deviation) < 0 ? 'negative' : ''
            } `}
            data-testid={`summary-deviation-${year}`}
          >
            {deviation}
          </span>
        </div>
      </td>
      {year === selectedYear && (
        <>
          {isCurrentYear && (
            <td
              key={`${year}-monthly-view`}
              className="monthly-summary-cell"
              data-testid="year-summary"
            ></td>
          )}
          {moment.months().map((m) => (
            <td
              key={m}
              className={`monthly-cell hoverable-${m}`}
              data-testid={`graph-cell-${m}`}
              onMouseOver={() => setHoveredClassToMonth(m)}
              onMouseLeave={() => removeHoveredClassFromMonth(m)}
            >
              {/* There's going to be graph here and we can use each months cell to paint the graph */}
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableRealizedBudgetCell);
