import { FC, memo } from 'react';
import { formattedNumberToNumber } from '@/utils/calculations';
import './styles.css';

interface IPlanningSummaryTableRealizedBudgetCellProps {
  frameBudget?: string;
  deviation?: string;
  year: number;
  selectedYear: number | null;
}

const months = ['tam', 'hel', 'maa', 'huh', 'tou', 'kes', 'hei', 'elo', 'syy', 'lok', 'mar', 'jou'];

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
        <>
          <td key={`${year}-monthly-view`} className="!min-w-[100px]"></td>
          {months.map((m) => (
            <td key={m} className="!w-[39px] !min-w-[39px] !max-w-[39px] !p-0 !pr-0">
              {/* TODO: there's going to be graph here and we can use each months cell to paint the graph */}
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableRealizedBudgetCell);
