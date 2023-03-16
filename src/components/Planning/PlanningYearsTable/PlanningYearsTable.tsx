import { FC, memo } from 'react';
import { planningYearsTableData } from '@/mocks/common';
import { BubbleIcon } from '../../shared';
import './styles.css';

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value }: { value: string }) => (
  <span className="text-sm">
    <BubbleIcon value="y" color="black" size="s" />
    {`+${value}`}
  </span>
));

const PlanningYearsTable: FC = () => {
  return (
    <table cellSpacing={0} className="planning-years-table">
      <thead>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="min-w-[var(--table-cell-width)] max-w-[var(--table-cell-width)]">
              <span className="text-sm font-light">{o.title}</span>
              <span className="text-sm font-bold">{`<> ${o.year}`}</span>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="years-table-first-cell">
              <span className="text-sm font-light text-white">{o.sum}</span>
            </td>
          ))}
        </tr>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i}>
              <span className="pt-1 text-sm font-light">{o.otherVal3 || ''}</span>
            </td>
          ))}
        </tr>
        <tr>
          {planningYearsTableData.map((p, i) => (
            <td key={p.year}>
              {i === 0 ? (
                // Overrun sum for first cell
                <OverrunSum value={p.otherVal1} />
              ) : (
                <span className="text-sm font-light">{p.otherVal1}</span>
              )}
              <span className="pb-1 text-sm font-light">{p.otherVal2}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningYearsTable;
