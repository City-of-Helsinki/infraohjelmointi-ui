import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { NameTooltip } from '../NameTooltip';
import { IPlanningTableRow } from '@/interfaces/common';

import './styles.css';

interface IPlanningClassesHeaderProps extends IPlanningTableRow {
  handleExpand: () => void;
  expanded?: boolean;
}

const PlanningClassesHeader: FC<IPlanningClassesHeaderProps> = ({
  link,
  name,
  type,
  handleExpand,
  expanded,
}) => {
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
        <button className="table-title-container" onClick={onExpand}>
          <span className="table-header-title">{name}</span>
          {/* FIXME: Tooltip (visible if the header-content-item container is hovered) */}
          <NameTooltip value={name} />
        </button>
      </div>
    </th>
  );
};

export default memo(PlanningClassesHeader);
