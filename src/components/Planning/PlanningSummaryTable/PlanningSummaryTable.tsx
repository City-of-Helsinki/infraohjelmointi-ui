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

  const { element } = useScrollableElement('planning-table-container');

  useEffect(() => {
    if (!element) {
      return;
    }

    const onScroll = (): void => {
      tableRef?.current?.parentElement?.scrollTo({ left: element.scrollLeft });
    };
    element.addEventListener('scroll', onScroll);

    return () => {
      element.removeEventListener('scroll', onScroll);
    };
  }, [element]);

  useEffect(() => {
    const onScroll = (): void => {
      // to void forever loop, we need to check whther crolling is happining while mouse is over the head element
      if (mouseOver) {
        element?.scrollTo({ left: tableRef.current.parentElement?.scrollLeft });
      }
    };
    const onMouseOver = () => {
      mouseOver = true;
    };
    const onMouseLeave = () => {
      mouseOver = false;
    };

    tableRef.current.parentElement?.addEventListener('scroll', onScroll);
    tableRef.current.parentElement?.addEventListener('mouseover', onMouseOver);
    tableRef.current.parentElement?.addEventListener('mouseleave', onMouseLeave);

    return () => {
      tableRef.current.parentElement?.removeEventListener('scroll', onScroll);
      tableRef.current.parentElement?.removeEventListener('mouseover', onMouseOver);
      tableRef.current.parentElement?.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [tableRef]);

  return (
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
  );
};

export default memo(PlanningSummaryTable);
