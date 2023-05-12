import { FC, memo } from 'react';
import { formattedNumberToNumber } from '@/utils/calculations';
import './styles.css';

interface IPlanningSummaryTableRealizedBudgetCellProps {
  frameBudget?: string;
  deviation?: string;
  year: number;
  selectedYear: number | null;
}

const PlanningSummaryTableRealizedBudgetCell: FC<IPlanningSummaryTableRealizedBudgetCellProps> = ({
  frameBudget,
  deviation,
  year,
  selectedYear,
}) => {
  return (
    <>
      <td>
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
        <td key={`${year}-monthly-view`} className="!min-w-[500px]">
          <span className="!text-left text-sm font-light">{'Monthly view cell'}</span>
        </td>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableRealizedBudgetCell);
