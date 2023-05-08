import { FC } from 'react';
import useSummaryRows from '@/hooks/useSummaryRows';
import { IPlanningRowLists, IPlanningRowSelections } from '@/interfaces/common';
import _ from 'lodash';
import './styles.css';

interface IPlanningSummaryTableProps {
  startYear: number;
  selections: IPlanningRowSelections;
  lists: IPlanningRowLists;
}

const PlanningSummaryTable: FC<IPlanningSummaryTableProps> = ({ startYear, selections, lists }) => {
  const { header, cells } = useSummaryRows({ startYear, selections, lists });
  return (
    <table cellSpacing={0} className="planning-summary-table">
      {/* Head */}
      <thead data-testid="planning-summary-head">
        {/* Year and title row */}
        <tr data-testid="planning-summary-head-row">
          {header.map(({ year, title }) => (
            <td key={year} data-testid={`head-${year}`}>
              <span className="text-sm font-light">{title}</span>
              <span className="text-sm font-bold">{`<> ${year}`}</span>
            </td>
          ))}
        </tr>
      </thead>
      {/* Body */}
      <tbody data-testid="planning-summary-body">
        {/* Planned budget row */}
        <tr data-testid="planning-summary-planned-budget-row">
          {cells.map(({ plannedBudget, key }) => (
            <td key={key} className="planned-budget-cell">
              <span data-testid={`summary-budget-${key}`}>{plannedBudget}</span>
            </td>
          ))}
        </tr>
        {/* Frame budget and deviation row */}
        <tr data-testid="planning-summary-realized-budget-row" className="align-top">
          {cells.map(({ frameBudget, deviation, key }) => (
            <td key={key}>
              <div className="planning-summary-frame-and-deviation-container">
                <span className="frame-budget" data-testid={`summary-frame-${key}`}>
                  {frameBudget}
                </span>
                <span
                  className={`deviation ${deviation && parseInt(deviation) < 0 ? 'negative' : ''} `}
                  data-testid={`summary-deviation-${key}`}
                >
                  {deviation}
                </span>
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningSummaryTable;
