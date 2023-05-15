import { FC, memo } from 'react';
import { formattedNumberToNumber } from '@/utils/calculations';
import './styles.css';
import moment from 'moment';

interface IPlanningSummaryTableRealizedBudgetCellProps {
  frameBudget?: string;
  deviation?: string;
  year: number;
  selectedYear: number | null;
  isFirstYear: boolean;
}

const PlanningSummaryTableRealizedBudgetCell: FC<IPlanningSummaryTableRealizedBudgetCellProps> = ({
  frameBudget,
  deviation,
  year,
  selectedYear,
  isFirstYear,
}) => {
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
          {isFirstYear && <td key={`${year}-monthly-view`} className="monthly-summary-cell"></td>}
          {moment.monthsShort().map((m) => (
            <td key={m} className="monthly-cell">
              {/* TODO: there's going to be graph here and we can use each months cell to paint the graph */}
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableRealizedBudgetCell);
