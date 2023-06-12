/* eslint-disable react/jsx-key */
import { memo, useEffect, useRef, useState } from 'react';
import useSummaryRows from '@/hooks/useSummaryRows';
import PlanningSummaryTableHeadCell from './PlanningSummaryTableHeadCell';
import PlanningSummaryTablePlannedBudgetCell from './PlanningSummaryTablePlannedBudgetCell';
import PlanningSummaryTableRealizedBudgetCell from './PlanningSummaryTableRealizedBudgetCell';
import './styles.css';

let mouseOver = false;

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

  const tableRef = useRef() as React.MutableRefObject<HTMLTableElement>;
  const dateIndicatorRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const { element: planningTable } = useScrollableElement('planning-table-container');

  // Listen to PlanningTable and update scroll position for PlanningSummaryTable
  useEffect(() => {
    if (!planningTable) {
      return;
    }

    const onScroll = (): void => {
      tableRef?.current?.parentElement?.scrollTo({ left: planningTable.scrollLeft });
      dateIndicatorRef?.current?.scrollTo({ left: planningTable.scrollLeft });
    };

    planningTable.addEventListener('scroll', onScroll);

    return () => {
      planningTable.removeEventListener('scroll', onScroll);
    };
  }, [planningTable]);

  // Listen to PlanningSummaryTable and update scroll position for PlanningTable
  useEffect(() => {
    const onScroll = (): void => {
      // to void forever loop, we need to check whther crolling is happining while mouse is over the head element
      if (mouseOver) {
        planningTable?.scrollTo({ left: tableRef.current.parentElement?.scrollLeft });
      }
    };
    const onMouseOver = () => {
      mouseOver = true;
    };
    const onMouseLeave = () => {
      mouseOver = false;
    };

    tableRef.current?.parentElement?.addEventListener('scroll', onScroll);
    tableRef.current?.parentElement?.addEventListener('mouseover', onMouseOver);
    tableRef.current?.parentElement?.addEventListener('mouseleave', onMouseLeave);

    return () => {
      tableRef.current?.parentElement?.removeEventListener('scroll', onScroll);
      tableRef.current?.parentElement?.removeEventListener('mouseover', onMouseOver);
      tableRef.current?.parentElement?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [tableRef, planningTable]);

  useEffect(() => {
    if (!dateIndicatorRef || !dateIndicatorRef.current) {
      return;
    }

    const dateIndicatorElement = dateIndicatorRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showDateIndicator = (e: any) => {
      console.log('event data: ', e.detail);
      dateIndicatorElement.style.left = `${e.detail.position}px`;
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
        <table cellSpacing={0} className="planning-summary-table" ref={tableRef}>
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
          className="absolute top-6 z-[999] !w-[2px] bg-metro"
          ref={dateIndicatorRef}
          id="date-indicator"
        />
      </div>
    </div>
  );
};

export default memo(PlanningSummaryTable);
