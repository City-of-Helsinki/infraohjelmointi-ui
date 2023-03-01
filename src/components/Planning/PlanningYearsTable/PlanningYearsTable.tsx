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
            <td key={i} className="years-table-cell">
              <span className="font-light text-sm">{o.title}</span>
              <span className="font-bold text-sm">{`<> ${o.year}`}</span>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i} className="row-1-cell">
              <span className="font-light text-white text-sm">{o.sum}</span>
            </td>
          ))}
        </tr>
        <tr>
          {planningYearsTableData.map((o, i) => (
            <td key={i}>
              <span className="font-light text-sm pt-1">{o.otherVal3 || ''}</span>
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
                <span className="font-light text-sm">{o.otherVal1}</span>
              )}
              <span className="font-light text-sm pb-1">{o.otherVal2}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningYearsTable;
