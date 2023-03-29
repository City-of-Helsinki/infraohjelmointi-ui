import useDoubleClick from '@/hooks/useDoubleClick';
import { ProjectCellGrowDirection } from '@/interfaces/projectInterfaces';
import { IconAngleLeft } from 'hds-react/icons';
import { useRef } from 'react';

const EditTimelineButton = ({
  direction,
  onSingleClick,
  onDoubleClick,
}: {
  direction: ProjectCellGrowDirection;
  onSingleClick: (d: ProjectCellGrowDirection) => void;
  onDoubleClick: (d: ProjectCellGrowDirection) => void;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleSingleClick = () => onSingleClick(direction);
  const handleDoubleClick = () => onDoubleClick(direction);

  useDoubleClick(buttonRef, handleSingleClick, handleDoubleClick);

  return (
    <button ref={buttonRef} className={`edit-timeline-button ${direction}`}>
      <IconAngleLeft />
    </button>
  );
};

export default EditTimelineButton;
