/* eslint-disable react/jsx-key */
import { memo, useEffect, useRef, useState } from 'react';
import useSummaryRows from '@/hooks/useSummaryRows';
import PlanningSummaryTableHeadCell from './PlanningSummaryTableHeadCell';
import PlanningSummaryTablePlannedBudgetCell from './PlanningSummaryTablePlannedBudgetCell';
import PlanningSummaryTableRealizedBudgetCell from './PlanningSummaryTableRealizedBudgetCell';
import './styles.css';

let overPlanningSummaryTable = false;
let dateIndicatorStartPosition = 0;

const useScrollableElement = (elementId: string) => {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined);

  useEffect(() => {
    if (element) {
      return;
    }

    const interval = setInterval(() => {
      const targetTable = document.getElementById(elementId);
      if (targetTable) {
        clearInterval(interval);
        setElement(targetTable);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { element };
};

const PlanningSummaryTable = () => {
  const { heads, cells } = useSummaryRows();

  const planningSummaryTableRef = useRef() as React.MutableRefObject<HTMLTableElement>;
  const dateIndicatorRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const { element: planningTable } = useScrollableElement('planning-table-container');

  // Listen to PlanningSummaryTable/PlanningTable and update scroll position for PlanningTable/PlanningSummaryTable
  useEffect(() => {
    /**
     * Listen to planning table scroll
     */
    const onPlanningTableScroll = (): void => {
      planningSummaryTableRef?.current?.parentElement?.scrollTo({
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

    /**
     * Listen to planning summary table scroll
     */
    const onPlanningSummaryTableScroll = (): void => {
      // to void forever loop, we need to check whther crolling is happining while mouse is over the head element
      if (overPlanningSummaryTable) {
        planningTable?.scrollTo({
          left: planningSummaryTableRef.current.parentElement?.scrollLeft,
        });
      }
    };
    const onPlanningSummaryTableOver = () => {
      overPlanningSummaryTable = true;
    };
    const onPlanningSummaryTableLeave = () => {
      overPlanningSummaryTable = false;
    };
    planningSummaryTableRef.current?.parentElement?.addEventListener(
      'scroll',
      onPlanningSummaryTableScroll,
    );
    planningSummaryTableRef.current?.parentElement?.addEventListener(
      'mouseover',
      onPlanningSummaryTableOver,
    );
    planningSummaryTableRef.current?.parentElement?.addEventListener(
      'mouseleave',
      onPlanningSummaryTableLeave,
    );

    return () => {
      /**
       * Remove listeners from planning summary table
       */
      planningSummaryTableRef.current?.parentElement?.removeEventListener(
        'scroll',
        onPlanningSummaryTableScroll,
      );
      planningSummaryTableRef.current?.parentElement?.removeEventListener(
        'mouseover',
        onPlanningSummaryTableOver,
      );
      planningSummaryTableRef.current?.parentElement?.removeEventListener(
        'mouseleave',
        onPlanningSummaryTableLeave,
      );

      /**
       * Remove listeners from planning table
       */
      planningTable?.removeEventListener('scroll', onPlanningTableScroll);
    };
  }, [planningSummaryTableRef, planningTable]);

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

    const setElementHeight = () => {
      const { scrollHeight } = document.documentElement;
      dateIndicatorElement.style.height = `${scrollHeight}px`;
    };

    // Call the setElementHeight function initially and on window resize
    setElementHeight();

    // Attach an event listener to update the element's height on window resize
    window.addEventListener('resize', setElementHeight);
    dateIndicatorElement.addEventListener('showDateIndicator', showDateIndicator);
    return () => {
      dateIndicatorElement.removeEventListener('showDateIndicator', showDateIndicator);
      window.removeEventListener('resize', setElementHeight);
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
              {heads.map(({ year, title, isCurrentYear }) => (
                <PlanningSummaryTableHeadCell
                  key={year}
                  year={year}
                  title={title}
                  isCurrentYear={isCurrentYear}
                />
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
      <div className="relative h-3 w-full bg-black-90">
        <div
          className="absolute top-[-95px] z-[999] hidden !w-[2px] bg-metro"
          ref={dateIndicatorRef}
          id="date-indicator"
        />
      </div>
    </div>
  );
};

export default memo(PlanningSummaryTable);
