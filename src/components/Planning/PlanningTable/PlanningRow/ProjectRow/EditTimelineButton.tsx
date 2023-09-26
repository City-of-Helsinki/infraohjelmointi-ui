import useDoubleClick from '@/hooks/useDoubleClick';
import { ProjectCellGrowDirection } from '@/interfaces/projectInterfaces';
import { IconAngleLeft } from 'hds-react/icons';
import { memo, useRef } from 'react';

const EditTimelineButton = ({
  direction,
  id,
  onSingleClick,
  onDoubleClick,
}: {
  direction: ProjectCellGrowDirection;
  id: string;
  onSingleClick: (d: ProjectCellGrowDirection) => void;
  onDoubleClick: (d: ProjectCellGrowDirection) => void;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleSingleClick = () => onSingleClick(direction);
  const handleDoubleClick = () => onDoubleClick(direction);

  useDoubleClick(buttonRef, handleSingleClick, handleDoubleClick);

  return (
    <button
      ref={buttonRef}
      className={`edit-timeline-button ${direction}`}
      data-testid={`add-cell-${id}-${direction}`}
    >
      <IconAngleLeft />
    </button>
  );
};

export default memo(EditTimelineButton);
