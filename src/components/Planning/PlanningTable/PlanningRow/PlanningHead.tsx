import { IconAngleDown, IconAngleUp, IconMenuDots } from 'hds-react/icons';
import { FC, memo, useCallback, useMemo, MouseEvent as ReactMouseEvent, useState } from 'react';
import { IOption, IPlanningRow } from '@/interfaces/common';
import HoverTooltip from './HoverTooltip/HoverTooltip';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { dispatchContextMenuEvent } from '@/utils/events';
import DeleteGroupDialog from './DeleteGroupDialog/DeleteGroupDialog';
import { GroupDialog } from '../../GroupDialog';
import './styles.css';
import { useLocation, useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/common';
import { selectMode } from '@/reducers/planningSlice';
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
  const mode = useAppSelector(selectMode);
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
    (e: ReactMouseEvent<SVGAElement>) => {
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
  const onExpand = useCallback(() => {
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
  }, [handleExpand, id, mode, navigate, search, type]);

  return (
    <th className={`planning-head ${type} sticky left-0 z-50`} data-testid={`head-${id}`}>
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
              <IconMenuDots
                size="s"
                onClick={type === 'group' ? handleGroupRowMenu : undefined}
                data-testid={`show-more-icon-${id}`}
              />
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
