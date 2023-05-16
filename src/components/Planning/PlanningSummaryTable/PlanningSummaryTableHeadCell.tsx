import { FC, memo, useMemo } from 'react';
import { IconAngleLeft, IconAngleRight } from 'hds-react/icons';
import moment from 'moment';
import './styles.css';

interface IPlanningSummaryTableHeadCellProps {
  year: number;
  selectedYear: number | null;
  handleSetSelectedYear: (year: number | null) => void;
  title: string;
  isStartMonth: boolean;
}

const PlanningSummaryTableHeadCell: FC<IPlanningSummaryTableHeadCellProps> = ({
  year,
  selectedYear,
  handleSetSelectedYear,
  title,
  isStartMonth,
}) => {
  const leftArrow = useMemo(
    () => (selectedYear === year ? <IconAngleRight /> : <IconAngleLeft />),
    [selectedYear, year],
  );
  const rightArrow = useMemo(
    () => (selectedYear === year ? <IconAngleLeft /> : <IconAngleRight />),
    [selectedYear, year],
  );

  return (
    <>
      <td data-testid={`head-${year}`} className="planning-summary-head-cell">
        <button onClick={() => handleSetSelectedYear(year)}>
          <span className="text-sm font-light">{title}</span>
          <div className="arrows-container">
            {leftArrow}
            {rightArrow}
            <span className="text-sm font-bold">{year}</span>
          </div>
        </button>
      </td>
      {year === selectedYear && (
        <>
          {isStartMonth && (
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
