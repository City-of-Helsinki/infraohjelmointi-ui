import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { NameTooltip } from './NameTooltip';
import { IPlanningTableRow } from '@/interfaces/common';
import './styles.css';

interface IPlanningHeaderProps extends IPlanningTableRow {
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
    <th className={`table-header ${type}`}>
      <div className="table-header-content">
        <button className="display-flex" onClick={onExpand}>
          {angleIcon}
        </button>
        {type !== 'division' && (
          <div className={`table-header-content-dots`}>
            <IconMenuDots size="s" />
          </div>
        )}
        <div className="table-title-container">
          <button className="table-title-button" onClick={onExpand}>
            <span className="table-header-title">{name}</span>
          </button>
          <NameTooltip value={name} />
        </div>
      </div>
    </th>
  );
};

export default memo(PlanningHeader);
