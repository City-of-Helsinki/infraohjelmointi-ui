// Disabled jsx-key because eslint doesn't understand that the key is spread through props
/* eslint-disable react/jsx-key */
import { FC, memo } from 'react';
import PlanningClassesRow from './PlanningClassesRow/PlanningClassesRow';
import { IPlanningTableRow } from '@/interfaces/common';
import './styles.css';

interface IPlanningClassesTableProps {
  rows: Array<IPlanningTableRow>;
}

const PlanningClassesTable: FC<IPlanningClassesTableProps> = ({ rows }) => {
  return (
    <table className="planning-table" cellSpacing={0}>
      <tbody>
        {/* The planning table rows have a dynamic length, the first item could be either a masterClass or a district */}
        {rows.map((one: IPlanningTableRow) => (
          <PlanningClassesRow {...one}>
            {one.childRows.map((two) => (
              <PlanningClassesRow {...two}>
                {two.childRows.map((three) => (
                  <PlanningClassesRow {...three}>
                    {three.childRows.map((four) => (
                      <PlanningClassesRow {...four}>
                        {four.childRows.map((five) => (
                          <PlanningClassesRow {...five} />
                        ))}
                      </PlanningClassesRow>
                    ))}
                  </PlanningClassesRow>
                ))}
              </PlanningClassesRow>
            ))}
          </PlanningClassesRow>
        ))}
      </tbody>
    </table>
  );
};

export default memo(PlanningClassesTable);
