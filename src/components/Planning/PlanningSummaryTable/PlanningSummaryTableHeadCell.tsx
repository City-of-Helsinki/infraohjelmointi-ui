import { FC, memo, useCallback, useMemo } from 'react';
import { IconAngleLeft, IconAngleRight } from 'hds-react/icons';
import { getDaysInMonthForYear, getMonthToday, getToday } from '@/utils/dates';
import moment from 'moment';
import './styles.css';
import { calcPercentage } from '@/utils/calculations';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectSelectedYears, toggleSelectedYear } from '@/reducers/planningSlice';
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
  const selectedYears = useAppSelector(selectSelectedYears);

  // Toggles the given year in the selection so multiple monthly views can stay open simultaneously
  const handleSetSelectedYear = useCallback(
    (year: number) => {
      const isSelected = selectedYears.includes(year);
      dispatch(toggleSelectedYear(year));

      if (!isSelected) {
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
    [dispatch, isCurrentYear, selectedYears],
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
      left: selectedYears.includes(year) ? <IconAngleRight /> : <IconAngleLeft />,
      right: selectedYears.includes(year) ? <IconAngleLeft /> : <IconAngleRight />,
    }),
    [selectedYears, year],
  );

  const showDateIndicator = useCallback(
    (month: number) => month === getMonthToday() && isCurrentYear,
    [isCurrentYear],
  );

  // Dispatch an event that tells the PlanningSummaryTable to display the date indicator and what its position should be
  const notifyDateIndicator = useCallback(
    (i: number, m: string) => {
      if (showDateIndicator(i + 1)) {
        // "Async" hack to wait for the element to render before calling document.getElementById
        setTimeout(() => {
          const element = document.getElementById(`month-label-${year}-${m}`);
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
    },
    [getDateIndicatorLeftPixels, showDateIndicator, year],
  );

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
      {selectedYears.includes(year) && (
        <>
          {isCurrentYear && (
            <td key={`${year}-monthly-view`} className="monthly-summary-cell label">
              <div className="monthly-cell-container">
                <span data-testid="date-today-label">{getToday()}</span>
              </div>
            </td>
          )}
          {moment.months().map((m, i) => {
            const hoverKey = `${year}-${m}`;
            const monthLabelId = `month-label-${year}-${m}`;
            return (
              <td
                key={`${year}-${m}`}
                className={`monthly-cell label hoverable-${hoverKey}`}
                id={monthLabelId}
                onMouseOver={() => setHoveredClassToMonth(hoverKey)}
                onMouseLeave={() => removeHoveredClassFromMonth(hoverKey)}
              >
                <div className="monthly-cell-container relative" data-testid={monthLabelId}>
                  <span>{m.substring(0, 3)}</span>
                  {notifyDateIndicator(i, m)}
                </div>
              </td>
            );
          })}
        </>
      )}
    </>
  );
};

export default memo(PlanningSummaryTableHeadCell);
