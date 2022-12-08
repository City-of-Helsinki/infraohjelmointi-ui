import { FC } from 'react';
import { planningListYearsTableData } from '@/mocks/common';
import { Span } from '../shared';

const PlanningListYearsTable: FC = () => {
  return (
    <table cellSpacing={0} className="planning-list-years-table">
      <thead>
        <tr>
          {planningListYearsTableData.map((o, i) => (
            <td key={i} className="years-table-cell">
              <Span text={o.title} fontWeight="light" size="s" />
              <Span text={`<> ${o.year}`} fontWeight="bold" size="s" />
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {planningListYearsTableData.map((o, i) => (
            <td key={i} className="row-1-cell">
              <Span text={o.sum} fontWeight="light" size="s" color="white" />
            </td>
          ))}
        </tr>
        <tr>
          {planningListYearsTableData.map((o, i) => (
            <td key={i}>{o.otherVal3 && o.otherVal3}</td>
          ))}
        </tr>
        <tr>
          {planningListYearsTableData.map((o, i) => (
            <td key={i}>
              <Span text={o.otherVal1} fontWeight="light" size="s" />
              <Span text={o.otherVal2} fontWeight="light" size="s" />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningListYearsTable;
