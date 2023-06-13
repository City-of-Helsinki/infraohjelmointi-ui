import { Toolbar } from '../../shared';
import { IconCollapse, IconPlusCircle, IconSort } from 'hds-react/icons/';
import { useCallback, MouseEvent as ReactMouseEvent, useState, memo, useMemo } from 'react';
import { dispatchContextMenuEvent } from '@/utils/events';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { Button } from 'hds-react/components/Button';
import { GroupDialog } from '../GroupDialog';
import { ProjectProgrammedDialog } from '../ProjectProgrammedDialog';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectGroupsExpanded, setGroupsExpanded } from '@/reducers/planningSlice';
import { t } from 'i18next';
import './styles.css';

const PlanningToolbar = () => {
  const dispatch = useAppDispatch();
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const [toolbarState, setToolbarState] = useState({
    groupDialogVisible: false,
    projectProgrammedDialogVisible: false,
  });

  const HDSIconCollapse = useMemo(() => IconCollapse, []);
  const HDSIconSort = useMemo(() => IconSort, []);
  const HDSIconPlusCircle = useMemo(() => IconPlusCircle, []);

  const { groupDialogVisible, projectProgrammedDialogVisible } = toolbarState;

  const toggleGroupsExpanded = useCallback(() => {
    dispatch(setGroupsExpanded(!groupsExpanded));
  }, [dispatch, groupsExpanded]);

  const onShowProjectProgrammedDialog = useCallback(
    () => setToolbarState((current) => ({ ...current, projectProgrammedDialogVisible: true })),
    [],
  );

  const onCloseProjectProgrammedDialog = useCallback(
    () => setToolbarState((current) => ({ ...current, projectProgrammedDialogVisible: false })),
    [],
  );

  const onShowGroupDialog = useCallback(
    () => setToolbarState((current) => ({ ...current, groupDialogVisible: true })),
    [],
  );

  const onCloseGroupDialog = useCallback(
    () => setToolbarState((current) => ({ ...current, groupDialogVisible: false })),
    [],
  );

  // Open the custom context menu for editing the project phase on click
  const handleNewItemMenu = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.NEW_ITEM,
        newItemsMenuProps: {
          onShowProjectProgrammedDialog,
          onShowGroupDialog,
        },
      });
    },
    [onShowGroupDialog, onShowProjectProgrammedDialog],
  );

  return (
    <Toolbar
      left={
        <>
          <div className="planning-toolbar-left">
            <Button
              onClick={toggleGroupsExpanded}
              variant="supplementary"
              className="expand-groups-button"
              iconLeft={groupsExpanded ? <HDSIconCollapse /> : <HDSIconSort />}
            >
              {groupsExpanded ? t(`closeAllGroups`) || '' : t('openAllGroups') || ''}
            </Button>

            <Button
              variant="supplementary"
              className="!text-black"
              iconLeft={<HDSIconPlusCircle />}
              data-testid="open-new-item-context-menu"
              onMouseDown={handleNewItemMenu}
            >
              Uusi
            </Button>
            <GroupDialog
              isOpen={groupDialogVisible}
              handleClose={onCloseGroupDialog}
              editMode={false}
              projects={[]}
              id={null}
            />
            <ProjectProgrammedDialog
              isVisible={projectProgrammedDialogVisible}
              onCloseProjectProgrammedDialog={onCloseProjectProgrammedDialog}
            />
          </div>
        </>
      }
    />
  );
};

export default memo(PlanningToolbar);
