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

const PlanningHeader: FC<IPlanningHeaderProps> = ({
  link,
  name,
  type,
  handleExpand,
  expanded,
  id,
  costEstimateBudget,
  availableFrameBudget,
  deviation,
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

  const displayBudgets = type !== 'division';

  return (
    <th className={`planning-header ${type}`} data-testid={`head-${id}`}>
      <div className="flex w-full justify-between">
        <div className="planning-header-content">
          <button className="flex" data-testid={`expand-${id}`} onClick={onExpand}>
            {angleIcon}
          </button>
          {displayBudgets && (
            <div className={`planning-header-content-dots`} data-testid={`show-more-${id}`}>
              <IconMenuDots size="s" />
            </div>
          )}
          <div className="planning-title-container">
            <button
              className="planning-title-button"
              onClick={onExpand}
              data-testid={`title-${id}`}
            >
              <span className="planning-header-title">{name}</span>
            </button>
            <NameTooltip value={name} id={id} />
          </div>
        </div>
        {displayBudgets && (
          <div className="grid w-[5.5rem] grid-flow-row text-right">
            <span className="text-base" data-testid={`available-frame-budget-${id}`}>
              {availableFrameBudget}
            </span>
            <span className="text-sm font-normal" data-testid={`cost-estimate-budget-${id}`}>
              {costEstimateBudget}
            </span>
            <span
              className={`planning-header-deviation ${
                deviation.isNegative ? 'negative' : ''
              } ${type}`}
              data-testid={`deviation-${id}`}
            >
              {deviation.value}
            </span>
          </div>
        )}
      </div>
    </th>
  );
};

export default memo(PlanningHeader);
