import { IconAngleDown, IconAngleUp, IconMenuDots, IconSize } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo, MouseEvent as ReactMouseEvent, useState } from 'react';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IOption } from '@/interfaces/common';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { dispatchContextMenuEvent, dispatchTooltipEvent } from '@/utils/events';
import DeleteGroupDialog from './DeleteGroupDialog/DeleteGroupDialog';
import { GroupDialog } from '../../GroupDialog';
import './styles.css';
import { useLocation, useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectHoverTooltipsEnabled,
  selectPlanningMode,
} from '@/reducers/planningSlice';
import { createSearchParams } from 'react-router-dom';

interface IPlanningHeadProps extends IPlanningRow {
  handleExpand: () => void;
  expanded?: boolean;
}

const PlanningHead: FC<IPlanningHeadProps> = ({
  name,
  type,
  handleExpand,
  expanded,
  id,
  costEstimateBudget,
  plannedBudgets,
  deviation,
  projectRows,
  urlSearchParam,
}) => {
  const navigate = useNavigate();
  const mode = useAppSelector(selectPlanningMode);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const hoverTooltipsEnabled = useAppSelector(selectHoverTooltipsEnabled);
  const { search } = useLocation();

  const [groupDialogState, setGroupDialogState] = useState({
    groupDeleteOpen: false,
    groupEditOpen: false,
  });

  const angleIcon = useMemo(() => (expanded ? <IconAngleUp /> : <IconAngleDown />), [expanded]);

  const projectsToIOption = useCallback((): IOption[] => {
    return projectRows.map((p) => ({ value: p.id, label: p.name }));
  }, [projectRows]);

  const onShowGroupDeleteDialog = useCallback(() => {
    setGroupDialogState((current) => ({ ...current, groupDeleteOpen: true }));
  }, []);

  const onCloseGroupDeleteDialog = useCallback(() => {
    setGroupDialogState((current) => ({ ...current, groupDeleteOpen: false }));
  }, []);

  const onShowGroupEditDialog = useCallback(() => {
    setGroupDialogState((current) => ({ ...current, groupEditOpen: true }));
  }, []);

  const onCloseGroupEditDialog = useCallback(() => {
    setGroupDialogState((current) => ({ ...current, groupEditOpen: false }));
  }, []);

  // Open the custom context menu for editing groups
  const handleGroupRowMenu = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.EDIT_GROUP_ROW,
        groupRowMenuProps: { groupName: name, onShowGroupDeleteDialog, onShowGroupEditDialog },
      });
    },
    [name, onShowGroupDeleteDialog, onShowGroupEditDialog],
  );

  /**
   * Adds the currently clicked items id to the search params, expand the row and navigate to the new URL
   */
  const onExpand = useCallback(
    (event: ReactMouseEvent<SVGElement | HTMLElement>) => {
      dispatchTooltipEvent(event, 'hide', { text: '' });
      handleExpand();

      const urlSearchParams = new URLSearchParams(search);
      const searchParams = Object.fromEntries(urlSearchParams.entries());

      if (urlSearchParam) {
        Object.assign(searchParams, urlSearchParam);
      }

      navigate({
        pathname: `/${mode}`,
        search: `${createSearchParams(searchParams)}`,
      });
    },
    [handleExpand, mode, navigate, search, urlSearchParam],
  );

  const showTooltip = useCallback(
    (event: React.SyntheticEvent<HTMLSpanElement>) => {
      if (!hoverTooltipsEnabled) {
        return;
      }
      const targetElement = event.target as HTMLElement;
      const text = targetElement.textContent || targetElement.innerText;
      dispatchTooltipEvent(event, 'show', { text });
    },
    [hoverTooltipsEnabled],
  );

  const hideTooltip = useCallback((event: React.SyntheticEvent<HTMLSpanElement>) => {
    dispatchTooltipEvent(event, 'hide', { text: '' });
  }, []);

  return (
    <th
      className={`planning-head ${type} ${mode} ${forcedToFrame ? 'framed' : ''}`}
      data-testid={`head-${id}`}
    >
      <div className="flex w-full justify-between">
        {/* Title and icons */}
        <div className="planning-head-content">
          <button className="flex" data-testid={`expand-${id}`} onClick={onExpand}>
            {angleIcon}
          </button>
          {type !== 'division' && (
            <div
              className={`planning-head-content-dots cursor-pointer`}
              data-testid={`show-more-${id}`}
            >
              {type === 'group' && (
                <>
                  <GroupDialog
                    isOpen={groupDialogState.groupEditOpen}
                    handleClose={onCloseGroupEditDialog}
                    id={id}
                    editMode={true}
                    projects={projectsToIOption()}
                  />
                  <DeleteGroupDialog
                    isVisible={groupDialogState.groupDeleteOpen}
                    onCloseDeleteGroupDialog={onCloseGroupDeleteDialog}
                    groupName={name}
                    id={id}
                  />
                </>
              )}
              <button onClick={handleGroupRowMenu} data-testid={`show-more-icon-${id}`}>
                <IconMenuDots size={IconSize.Small} />
              </button>
            </div>
          )}
          <div className="planning-title-container">
            <button
              className="planning-title-button"
              onClick={onExpand}
              data-testid={`title-${id}`}
            >
              <span
                className="planning-head-title"
                onMouseOver={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                tabIndex={0}
              >
                {name}
              </span>
            </button>
          </div>
        </div>
        {/* Budgets (not visible for coordinator) */}
        {mode === 'planning' && (
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
        )}
      </div>
    </th>
  );
};

export default memo(PlanningHead);
