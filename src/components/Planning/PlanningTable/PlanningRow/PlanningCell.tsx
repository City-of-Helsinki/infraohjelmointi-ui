import { BubbleIcon } from '../../../shared';
import { FC, memo } from 'react';
import './styles.css';
import { IPlanningRow } from '@/interfaces/common';

interface IPlanningCellProps extends IPlanningRow {
  sum: string;
  position: number;
}

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value }: { value: string }) => (
  <span>
    <BubbleIcon value="y" color="white" size="s" />
    {`+${value}`}
  </span>
));

const PlanningCell: FC<IPlanningCellProps> = ({ sum, position, type }) => {
  return (
    <td className={`table-cell ${type}`}>
      {/* temporarily hide mock values if it's division */}
      {type !== 'division' && (
        <div className={`planning-cell-container`}>
          <span>{sum}</span>
          {position === 0 && type !== 'group' && type !== 'district' ? (
            // Add overright icon for the first cell of every row
            <OverrunSum value={sum} />
          ) : (
            // Only display the value for the rest of the cells
            <span>{sum}</span>
          )}
          {position === 0 && type !== 'group' && type !== 'district' && <span>{sum}</span>}
        </div>
      )}
    </td>
  );
};

export default memo(PlanningCell);
