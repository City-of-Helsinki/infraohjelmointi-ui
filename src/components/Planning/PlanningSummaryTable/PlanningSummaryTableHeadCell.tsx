import { FC, memo, useCallback, useMemo } from 'react';
import { IconAngleLeft, IconAngleRight } from 'hds-react/icons';
import { getDaysInMonthForYear, getMonthToday, getToday } from '@/utils/dates';
import moment from 'moment';
import './styles.css';
import { calcPercentage } from '@/utils/calculations';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectSelectedYear, setSelectedYear } from '@/reducers/planningSlice';
import { removeHoveredClassFromMonth, setHoveredClassToMonth } from '@/utils/common';
import { dispatchDateIndicatorEvent } from '@/utils/events';

interface IPlanningSummaryTableHeadCellProps {
  year: number;
  title: string;
  isCurrentYear: boolean;
}

const PlanningSummaryTableHeadCell: FC<IPlanningSummaryTableHeadCellProps> = ({
  year,
  title,
  isCurrentYear,
}) => {
  const dispatch = useAppDispatch();
  const selectedYear = useAppSelector(selectSelectedYear);

  // Sets the selectedYear or null if the year is given again, so that the monthly view can be closed
  // when the same year is re-clicked
  const handleSetSelectedYear = useCallback(
    (year: number | null) => {
      dispatch(setSelectedYear(year === selectedYear ? null : year));

      if (selectedYear !== year) {
        // when opening not current year
        dispatchDateIndicatorEvent({
          isVisible: isCurrentYear,
          position: 0,
        });
      } else {
        // when closing current or other year
        dispatchDateIndicatorEvent({
          isVisible: false,
          position: 0,
        });
      }
    },
    [dispatch, selectedYear],
  );

  /**
   * Get the left pixel position of the date indicator by calculating the percent of the month
   * that has past and convert that percent to pixels.
   *
   * - the total width of one month is 39px
   * - each px is around 2.55% of the of the total width
   */
  const getDateIndicatorLeftPixels = useCallback(
    (month: number) => {
      const daysInMonth = getDaysInMonthForYear(year, month);
      const dayToday = parseInt(moment().format('D'));
      const percentOfMonthThatHasPast = calcPercentage(dayToday, daysInMonth);

      return Math.floor(percentOfMonthThatHasPast / 2.55);
    },
    [year],
  );

  const arrows = useMemo(
    () => ({
      left: selectedYear === year ? <IconAngleRight /> : <IconAngleLeft />,
      right: selectedYear === year ? <IconAngleLeft /> : <IconAngleRight />,
    }),
    [selectedYear, year],
  );

  const showDateIndicator = useCallback(
    (month: number) => month === getMonthToday() && isCurrentYear,
    [isCurrentYear],
  );

  // Dispatch an event that tells the PlanningSummaryTable to display the date indicator and what its position should be
  const notifyDateIndicator = useCallback((i: number, m: string) => {
    if (showDateIndicator(i + 1)) {
      // "Async" hack to wait for the element to render before calling document.getElementById
      setTimeout(() => {
        const element = document.getElementById(`month-label-${m}`);
        if (element) {
          const elementPosition = (element as HTMLElement).offsetLeft;
          dispatchDateIndicatorEvent({
            isVisible: true,
            position: elementPosition + getDateIndicatorLeftPixels(i + 1),
          });
        }
      }, 0);
    }
    return null;
  }, []);

  return (
    <>
      <td data-testid={`head-${year}`} className="planning-summary-head-cell">
        <button
          onClick={() => handleSetSelectedYear(year)}
          data-testid={`expand-monthly-view-button-${year}`}
        >
          <span className="text-sm font-light">{title}</span>
          <div className="arrows-container">
            {arrows.left}
            {arrows.right}
            <span className="text-sm font-bold">{year}</span>
          </div>
        </button>
      </td>
      {year === selectedYear && (
        <>
          {isCurrentYear && (
            <td key={`${year}-monthly-view`} className="monthly-summary-cell label">
              <div className="monthly-cell-container">
                <span data-testid="date-today-label">{getToday()}</span>
              </div>
            </td>
          )}
          {moment.months().map((m, i) => (
            <td
              key={m}
              className={`monthly-cell label hoverable-${m}`}
              id={`month-label-${m}`}
              onMouseOver={() => setHoveredClassToMonth(m)}
              onMouseLeave={() => removeHoveredClassFromMonth(m)}
            >
              <div className="monthly-cell-container relative" data-testid={`month-label-${m}`}>
                <span>{m.substring(0, 3)}</span>
                {notifyDateIndicator(i, m)}
              </div>
            </td>
          ))}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableHeadCell);
