import { FC, memo } from 'react';
import { planningYearsTableData } from '@/mocks/common';
import { BubbleIcon } from '../../shared';
import './styles.css';

const OverrunSum = memo(({ value }: { value: string }) => (
  <span className="overrun-icon text-sm">
    <BubbleIcon value="y" color="black" size="s" />
    {`+${value}`}
  </span>
));

OverrunSum.displayName = 'OverrunSum';

const PlanningYearsTable: FC = () => {
  return (
    <table cellSpacing={0} className="planning-years-table">
      {/* Head */}
      <thead data-testid="planning-years-head">
        {/* Years row */}
        <tr data-testid="planning-years-head-row">
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="planning-year-cell" data-testid={`head-${o.year}`}>
              <span className="text-sm font-light">{o.title}</span>
              <span className="text-sm font-bold">{`<> ${o.year}`}</span>
            </td>
          ))}
        </tr>
      </thead>
      {/* Body */}
      <tbody data-testid="planning-years-body">
        {/* Budget row */}
        <tr data-testid="planning-years-total-budget-row">
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="planning-budget-cell" data-testid={`budget-${o.year}`}>
              <span className="text-sm font-light text-white">{o.sum}</span>
            </td>
          ))}
        </tr>
        {/* Realized budget row */}
        <tr data-testid="planning-years-realized-budget-row">
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="planning-realized-cell" data-testid={`realized-${o.year}`}>
              <span className="pt-1 text-sm font-light">{o.otherVal3 || ''}</span>
            </td>
          ))}
        </tr>
        {/* Overrun row */}
        <tr data-testid="planning-years-overrun-row">
          {planningYearsTableData.map((p, i) => (
            <td key={p.year} className="planning-overrun-cell" data-testid={`overrun-${p.year}`}>
              {i === 0 ? (
                // Overrun sum for first cell
                <OverrunSum value={p.otherVal1} />
              ) : (
                <span className="text-sm font-light">{p.otherVal1}</span>
              )}
            </td>
          ))}
        </tr>
        {/* Deviation row */}
        <tr data-testid="planning-years-deviation-row">
          {planningYearsTableData.map((p) => (
            <td
              key={p.year}
              className="planning-deviation-cell"
              data-testid={`deviation-${p.year}`}
            >
              <span className="pb-1 text-sm font-light">{p.otherVal2}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningYearsTable;
