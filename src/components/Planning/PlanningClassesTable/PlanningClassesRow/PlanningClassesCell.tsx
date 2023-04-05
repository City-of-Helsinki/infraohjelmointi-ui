import { BubbleIcon } from '../../../shared';
import { FC, memo } from 'react';
import { PlanningTableRowType } from '@/hooks/usePlanningTableRows';
import './styles.css';

interface IPlanningClassesCellProps {
  sum: string;
  position: number;
  type: PlanningTableRowType;
  defaultExpanded: boolean;
}

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value }: { value: string }) => (
  <span>
    <BubbleIcon value="y" color="white" size="s" />
    {`+${value}`}
  </span>
));

const PlanningClassesCell: FC<IPlanningClassesCellProps> = ({ sum, position, type }) => {
  return (
    <td className={`table-cell ${type}`}>
      {/* temporarily hide mock values if it's a subdivision */}
      {type !== 'division' && (
        <div className={`table-cell-container`}>
          <span>{sum}</span>
          {position === 0 ? (
            // Add overright icon for the first cell of every row
            <OverrunSum value={sum} />
          ) : (
            // Only display the value for the rest of the cells
            <span>{sum}</span>
          )}
          <span>{position === 0 && `${sum}`}</span>
        </div>
      )}
    </td>
  );
};

export default memo(PlanningClassesCell);
