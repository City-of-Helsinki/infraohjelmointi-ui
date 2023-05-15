import { FC, memo } from 'react';
import './styles.css';

interface IPlanningSummaryTableHeadCellProps {
  year: number;
  selectedYear: number | null;
  handleSetSelectedYear: (year: number | null) => void;
  title: string;
  isFirstYear: boolean;
}

const months = ['tam', 'hel', 'maa', 'huh', 'tou', 'kes', 'hei', 'elo', 'syy', 'lok', 'mar', 'jou'];

const PlanningSummaryTableHeadCell: FC<IPlanningSummaryTableHeadCellProps> = ({
  year,
  selectedYear,
  handleSetSelectedYear,
  title,
  isFirstYear,
}) => {
  return (
    <>
      <td data-testid={`head-${year}`} className="planning-summary-head-cell">
        <button onClick={() => handleSetSelectedYear(year)}>
          <span className="text-sm font-light">{title}</span>
          <span className="text-sm font-bold">{`<> ${year}`}</span>
        </button>
      </td>
      {year === selectedYear && (
        // className="!min-w-[500px]"

        <>
          {isFirstYear && (
            <td key={`${year}-monthly-view`} className="monthly-summary-cell">
              <span className="!text-center text-sm font-light">{'4.6.2020'}</span>
            </td>
          )}
          {months.map((m) => (
            <td key={m} className="monthly-cell">
              <span className="!text-center text-sm font-light">{m}</span>
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableHeadCell);
