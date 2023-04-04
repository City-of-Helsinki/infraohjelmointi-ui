import { BubbleIcon } from '../../../shared';
import { FC, memo } from 'react';
import { ClassTableHierarchy } from '@/interfaces/common';
import './styles.css';
import { PlanningTableRowType } from '@/hooks/usePlanningTableRows';

interface IPlanningClassesCellProps {
  sum: string;
  position: number;
  // hierarchy: ClassTableHierarchy;
  type: PlanningTableRowType;
}

// eslint-disable-next-line react/display-name
const OverrunSum = memo(({ value }: { value: string }) => (
  <span>
    <BubbleIcon value="y" color="white" size="s" />
    {`+${value}`}
  </span>
));

const PlanningClassesCell: FC<IPlanningClassesCellProps> = ({
  sum,
  position,
  //hierarchy,
  type,
}) => {
  // Hide values from districts, just a mock implementation to display things correctly for now
  // const hideValues = hierarchy === 'second' && type === 'location';

  const hideValues = false;
  const hierarchy = ClassTableHierarchy.First;

  return (
    <td className={`table-cell ${type} ${hierarchy}`}>
      {!hideValues && (
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
