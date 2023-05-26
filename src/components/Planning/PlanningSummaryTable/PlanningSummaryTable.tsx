/* eslint-disable react/jsx-key */
import { FC, memo } from 'react';
import useSummaryRows from '@/hooks/useSummaryRows';
import { IPlanningRowLists, IPlanningRowSelections } from '@/interfaces/common';
import PlanningSummaryTableHeadCell from './PlanningSummaryTableHeadCell';
import PlanningSummaryTablePlannedBudgetCell from './PlanningSummaryTablePlannedBudgetCell';
import PlanningSummaryTableRealizedBudgetCell from './PlanningSummaryTableRealizedBudgetCell';
import './styles.css';

interface IPlanningSummaryTableProps {
  startYear: number;
  selections: IPlanningRowSelections;
  lists: IPlanningRowLists;
  handleSetSelectedYear: (year: number | null) => void;
  selectedYear: number | null;
}

const PlanningSummaryTable: FC<IPlanningSummaryTableProps> = ({
  startYear,
  selections,
  lists,
  handleSetSelectedYear,
  selectedYear,
}) => {
  const { heads, cells } = useSummaryRows({ startYear, selections, lists });

  return (
    <table cellSpacing={0} className="planning-summary-table">
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
              handleSetSelectedYear={handleSetSelectedYear}
              selectedYear={selectedYear}
            />
          ))}
        </tr>
      </thead>
      {/* Body */}
      <tbody data-testid="planning-summary-body">
        {/* Planned budget row */}
        <tr data-testid="planning-summary-planned-budget-row">
          {cells.map((c) => (
            <PlanningSummaryTablePlannedBudgetCell {...c} selectedYear={selectedYear} />
          ))}
        </tr>
        {/* Frame budget and deviation row */}
        <tr data-testid="planning-summary-realized-budget-row" className="align-top">
          {cells.map((c) => (
            <PlanningSummaryTableRealizedBudgetCell {...c} selectedYear={selectedYear} />
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default memo(PlanningSummaryTable);
