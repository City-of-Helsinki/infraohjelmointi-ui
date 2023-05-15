import { FC, memo } from 'react';
import './styles.css';
import moment from 'moment';
import 'moment/locale/fi';

interface IPlanningSummaryTableHeadCellProps {
  year: number;
  selectedYear: number | null;
  handleSetSelectedYear: (year: number | null) => void;
  title: string;
  isFirstYear: boolean;
}

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
        <>
          {isFirstYear && (
            <td key={`${year}-monthly-view`} className="monthly-summary-cell label">
              <div className="monthly-cell-container">
                <span>{moment().format('D.M.YYYY')}</span>
              </div>
            </td>
          )}
          {moment.monthsShort().map((m) => (
            <td key={m} className="monthly-cell label">
              <div className="monthly-cell-container">
                <span>{m.substring(0, 3)}</span>
              </div>
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableHeadCell);
