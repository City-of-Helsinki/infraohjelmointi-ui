import { FC } from 'react';
import { planningYearsTableData } from '@/mocks/common';
import { BubbleIcon, Span } from '../../shared';
import './styles.css';

const OverrunSum = ({ value }: { value: string }) => (
  <div className="flex-row-end">
    <BubbleIcon value="y" color="black" size="s" />
    <span>{`+${value}`}</span>
  </div>
);

const PlanningYearsTable: FC = () => {
  return (
    <table cellSpacing={0} className="planning-years-table">
      <thead>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="years-table-cell">
              <Span text={o.title} fontWeight="light" size="s" />
              <Span text={`<> ${o.year}`} fontWeight="bold" size="s" />
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="row-1-cell">
              <Span text={o.sum} fontWeight="light" size="s" color="white" />
            </td>
          ))}
        </tr>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i}>
              <Span text={o.otherVal3 || ''} fontWeight="light" size="s" />
            </td>
          ))}
        </tr>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i}>
              {i === 0 ? (
                // Overrun sum for first cell
                <OverrunSum value={o.otherVal1} />
              ) : (
                <Span text={o.otherVal1} fontWeight="light" size="s" />
              )}

              <Span text={o.otherVal2} fontWeight="light" size="s" />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningYearsTable;
