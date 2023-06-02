import { Toolbar } from '../../shared';
import { IconPlusCircle } from 'hds-react/icons/';
import { useCallback, MouseEvent as ReactMouseEvent, useState } from 'react';
import { IPlanningRowSelections } from '@/interfaces/common';
import { dispatchContextMenuEvent } from '@/utils/events';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { Button } from 'hds-react/components/Button';
import './styles.css';
import { GroupDialog } from '../GroupDialog';
import { ProjectProgrammedDialog } from '../ProjectProgrammedDialog';

interface ProjectToolBarProps {
  selections: IPlanningRowSelections;
}
const ProjectToolbar = ({ selections }: ProjectToolBarProps) => {
  const [toolbarState, setToolbarState] = useState({
    groupDialogVisible: false,
    projectProgrammedDialogVisible: false,
  });

  const { groupDialogVisible, projectProgrammedDialogVisible } = toolbarState;

  const onShowProjectProgrammedDialog = useCallback(
    () => setToolbarState((current) => ({ ...current, projectProgrammedDialog: true })),
    [],
  );

  const onShowGroupDialog = useCallback(
    () => setToolbarState((current) => ({ ...current, groupDialogVisible: true })),
    [],
  );

  // Open the custom context menu for editing the project phase on click
  const handleNewItemMenu = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    dispatchContextMenuEvent(e, {
      menuType: ContextMenuType.NEW_ITEM,
      newItemsMenuProps: {
        selections,
        onShowProjectProgrammedDialog,
        onShowGroupDialog,
      },
    });
  }, []);

  return (
    <Toolbar
      left={
        <>
          {/* Add new group, project or bring project to list view */}
          <Button
            variant="supplementary"
            className="!text-black"
            iconLeft={<IconPlusCircle />}
            onMouseDown={handleNewItemMenu}
          >
            Uusi
          </Button>
          <GroupDialog visible={groupDialogVisible} />
          <ProjectProgrammedDialog visible={projectProgrammedDialogVisible} />
        </>
      }
    />
  );
};

export default ProjectToolbar;
