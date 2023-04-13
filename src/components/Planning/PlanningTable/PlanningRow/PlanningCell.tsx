import { BubbleIcon } from '../../../shared';
import { FC, memo } from 'react';
import './styles.css';
import { IPlanningRow } from '@/interfaces/common';

interface IPlanningCellProps extends IPlanningRow {
  sum: string;
  position: number;
}

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value, id }: { value: string; id: string }) => (
  <span data-testid={id}>
    <BubbleIcon value="y" color="white" size="s" />
    {`+${value}`}
  </span>
));

const PlanningCell: FC<IPlanningCellProps> = ({ sum, position, type, id }) => {
  const year = new Date().getFullYear() + position;
  return (
    <td className={`planning-cell ${type}`} data-testid={`cell-${id}-${year}`}>
      {/* temporarily hide mock values if it's a subdivision */}
      {type !== 'division' && (
        <div className={`planning-cell-container`}>
          <span data-testid={`budget-${id}-${year}`}>{sum}</span>
          {position === 0 && type !== 'group' && type !== 'district' ? (
            // Add overright icon for the first cell of every row
            <OverrunSum value={sum} id={`overrun-${id}-${year}`} />
          ) : (
            // Only display the value for the rest of the cells
            <span data-testid={`realized-${id}-${year}`}>{sum}</span>
          )}
          {position === 0 && type !== 'group' && type !== 'district' && (
            <span data-testid={`deviation-${id}-${year}`}>{sum}</span>
          )}
        </div>
      )}
    </td>
  );
};

export default memo(PlanningCell);
