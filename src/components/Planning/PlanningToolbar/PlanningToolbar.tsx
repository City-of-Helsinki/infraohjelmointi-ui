import { Toolbar } from '../../shared';
import { IconCollapse, IconPlusCircle, IconSort } from 'hds-react/icons/';
import { useCallback, MouseEvent as ReactMouseEvent, useState, FC, memo, useMemo } from 'react';
import { IPlanningRowSelections } from '@/interfaces/common';
import { dispatchContextMenuEvent } from '@/utils/events';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { Button } from 'hds-react/components/Button';
import { GroupDialog } from '../GroupDialog';
import { ProjectProgrammedDialog } from '../ProjectProgrammedDialog';
import './styles.css';
import { t } from 'i18next';

interface IPlanningToolbarProps {
  toggleGroupsExpanded: () => void;
  groupsExpanded: boolean;
  selections: IPlanningRowSelections;
}
const ProjectToolbar: FC<IPlanningToolbarProps> = ({
  toggleGroupsExpanded,
  groupsExpanded,
  selections,
}) => {
  const [toolbarState, setToolbarState] = useState({
    groupDialogVisible: false,
    projectProgrammedDialogVisible: false,
  });
  const HDSIconCollapse = useMemo(() => IconCollapse, []);
  const HDSIconSort = useMemo(() => IconSort, []);
  const HDSIconPlusCircle = useMemo(() => IconPlusCircle, []);
  const { groupDialogVisible, projectProgrammedDialogVisible } = toolbarState;

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
          selections,
          onShowProjectProgrammedDialog,
          onShowGroupDialog,
        },
      });
    },
    [onShowGroupDialog, onShowProjectProgrammedDialog, selections],
  );

  return (
    <Toolbar
      left={
        <>
          <div className="planning-toolbar-left">
            <Button
              onClick={toggleGroupsExpanded}
              variant="supplementary"
              className="!text-black"
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
            <GroupDialog isVisible={groupDialogVisible} onCloseGroupDialog={onCloseGroupDialog} />
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

export default memo(ProjectToolbar);
