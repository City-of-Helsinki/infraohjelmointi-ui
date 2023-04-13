import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { NameTooltip } from './NameTooltip';
import { IPlanningRow } from '@/interfaces/common';
import './styles.css';

interface IPlanningHeaderProps extends IPlanningRow {
  handleExpand: () => void;
  expanded?: boolean;
}

const PlanningHeader: FC<IPlanningHeaderProps> = ({ link, name, type, handleExpand, expanded }) => {
  const navigate = useNavigate();

  const angleIcon = useMemo(() => (expanded ? <IconAngleUp /> : <IconAngleDown />), [expanded]);

  const onExpand = useCallback(() => {
    // Navigate to the next nested path if there's a link
    if (link) {
      navigate(link);
    }
    handleExpand();
  }, [handleExpand, link, navigate]);

  return (
    <th className={`planning-header ${type}`}>
      <div className="planning-header-content">
        <button className="display-flex" onClick={onExpand}>
          {angleIcon}
        </button>
        {type !== 'division' && (
          <div className={`planning-header-content-dots`}>
            <IconMenuDots size="s" />
          </div>
        )}
        <div className="planning-title-container">
          <button className="planning-title-button" onClick={onExpand}>
            <span className="planning-header-title">{name}</span>
          </button>
          <NameTooltip value={name} />
        </div>
      </div>
    </th>
  );
};

export default memo(PlanningHeader);
