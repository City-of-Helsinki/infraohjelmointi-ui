/* eslint-disable react/jsx-key */
import { memo, useEffect, useRef } from 'react';
import useSummaryRows from '@/hooks/useSummaryRows';
import PlanningSummaryTableHeadCell from './PlanningSummaryTableHeadCell';
import PlanningSummaryTablePlannedBudgetCell from './PlanningSummaryTablePlannedBudgetCell';
import PlanningSummaryTableRealizedBudgetCell from './PlanningSummaryTableRealizedBudgetCell';
import useScrollableElement from '@/hooks/useScrollableElement';
import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { selectForcedToFrame } from '@/reducers/planningSlice';

let overPlanningSummaryTable = false;
let dateIndicatorStartPosition = 0;

const PlanningSummaryTable = () => {
  const { heads, cells } = useSummaryRows();

  const planningSummaryTableRef = useRef() as React.MutableRefObject<HTMLTableElement>;
  const dateIndicatorRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const forcedToFrame = useAppSelector(selectForcedToFrame);

  const { element: planningTable } = useScrollableElement('planning-table-container');

  /**
   * Listen to PlanningSummaryTable/PlanningTable and update scroll position for PlanningTable/PlanningSummaryTable
   */
  useEffect(() => {
    const planningSummaryTableParent = planningSummaryTableRef.current?.parentElement;

    const onPlanningTableScroll = (): void => {
      planningSummaryTableParent?.scrollTo({
        left: planningTable?.scrollLeft,
      });
      const dateIndicatorElement = dateIndicatorRef.current;
      const positionLeft = dateIndicatorStartPosition - (planningTable?.scrollLeft ?? 0);
      dateIndicatorElement.style.left = `${positionLeft}px`;

      let visibility = 'visible';
      if (positionLeft < 0) {
        visibility = 'hidden';
      }
      dateIndicatorElement.style.visibility = visibility;
    };
    planningTable?.addEventListener('scroll', onPlanningTableScroll);

    const onPlanningSummaryTableScroll = (): void => {
      // to avoid a forever loop, we need to check whether scrolling is happining while mouse is over the head element
      if (overPlanningSummaryTable) {
        planningTable?.scrollTo({
          left: planningSummaryTableParent?.scrollLeft,
        });
      }
    };
    const onPlanningSummaryTableOver = () => {
      overPlanningSummaryTable = true;
    };
    const onPlanningSummaryTableLeave = () => {
      overPlanningSummaryTable = false;
    };
    planningSummaryTableParent?.addEventListener('scroll', onPlanningSummaryTableScroll);
    planningSummaryTableParent?.addEventListener('mouseover', onPlanningSummaryTableOver);
    planningSummaryTableParent?.addEventListener('mouseleave', onPlanningSummaryTableLeave);

    return () => {
      /**
       * Remove listeners from planning summary table
       */
      planningSummaryTableParent?.removeEventListener('scroll', onPlanningSummaryTableScroll);
      planningSummaryTableParent?.removeEventListener('mouseover', onPlanningSummaryTableOver);
      planningSummaryTableParent?.removeEventListener('mouseleave', onPlanningSummaryTableLeave);

      /**
       * Remove listeners from planning table
       */
      planningTable?.removeEventListener('scroll', onPlanningTableScroll);
    };
  }, [planningSummaryTableRef, planningTable]);

  /**
   * Listen to showDateIndicator event and display the date indicator if isVisible is true
   */
  useEffect(() => {
    if (!dateIndicatorRef || !dateIndicatorRef.current) {
      return;
    }

    const dateIndicatorElement = dateIndicatorRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showDateIndicator = (e: any) => {
      dateIndicatorStartPosition = e.detail.position;
      dateIndicatorElement.style.left = `${e.detail.position}px`;

      let displayValue = 'block';
      if (!e.detail.isVisible) {
        displayValue = 'none';
      }
      dateIndicatorElement.style.display = displayValue;
    };

    dateIndicatorElement.addEventListener('showDateIndicator', showDateIndicator);
    return () => {
      dateIndicatorElement.removeEventListener('showDateIndicator', showDateIndicator);
    };
  }, [dateIndicatorRef]);

  return (
    <div className="planning-summary-table-container">
      <div className="scrollable-planning-summary-table">
        <table cellSpacing={0} className="planning-summary-table" ref={planningSummaryTableRef}>
          {/* Head */}
          <thead data-testid="planning-summary-head">
            {/* Year and title row */}
            <tr data-testid="planning-summary-head-row">
              {heads.map(({ year, title }) => (
                <PlanningSummaryTableHeadCell key={year} year={year} title={title} />
              ))}
            </tr>
          </thead>
          {/* Body */}
          <tbody data-testid="planning-summary-body">
            {/* Planned budget row */}
            <tr data-testid="planning-summary-planned-budget-row">
              {cells.map((c) => (
                <PlanningSummaryTablePlannedBudgetCell {...c} />
              ))}
            </tr>
            {/* Frame budget and deviation row */}
            <tr data-testid="planning-summary-realized-budget-row" className="align-top">
              {cells.map((c) => (
                <PlanningSummaryTableRealizedBudgetCell {...c} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div
        className={`date-indicator ${forcedToFrame ? 'framed' : ''}`}
        ref={dateIndicatorRef}
        id="date-indicator"
        data-testid="date-indicator"
      />
    </div>
  );
};

export default memo(PlanningSummaryTable);
