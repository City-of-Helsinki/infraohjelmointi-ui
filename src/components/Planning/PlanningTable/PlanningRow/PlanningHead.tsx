import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { IPlanningRow } from '@/interfaces/common';
import HoverTooltip from './HoverTooltip/HoverTooltip';
import './styles.css';

interface IPlanningHeadProps extends IPlanningRow {
  handleExpand: () => void;
  expanded?: boolean;
}

const PlanningHead: FC<IPlanningHeadProps> = ({
  link,
  name,
  type,
  handleExpand,
  expanded,
  id,
  costEstimateBudget,
  plannedBudgets,
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

  return (
    <th className={`planning-head ${type} sticky left-0 z-50`} data-testid={`head-${id}`}>
      <div className="flex w-full justify-between">
        {/* Title and icons */}
        <div className="planning-head-content">
          <button className="flex" data-testid={`expand-${id}`} onClick={onExpand}>
            {angleIcon}
          </button>
          {type !== 'division' && (
            <div className={`planning-head-content-dots`} data-testid={`show-more-${id}`}>
              <IconMenuDots size="s" />
            </div>
          )}
          <div className="planning-title-container">
            <button
              className="planning-title-button"
              onClick={onExpand}
              data-testid={`title-${id}`}
            >
              <span className="planning-head-title">{name}</span>
            </button>
            <HoverTooltip text={name} id={id} />
          </div>
        </div>
        {/* Budgets */}
        <div className="total-budgets">
          <span className="text-base" data-testid={`planned-budgets-${id}`}>
            {plannedBudgets}
          </span>
          <span className="text-sm font-normal" data-testid={`cost-estimate-budget-${id}`}>
            {costEstimateBudget}
          </span>
          <span className="planning-head-deviation" data-testid={`deviation-${id}`}>
            {deviation}
          </span>
        </div>
      </div>
    </th>
  );
};

export default memo(PlanningHead);
