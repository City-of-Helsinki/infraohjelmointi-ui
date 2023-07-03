import { Toolbar } from '../../shared';
import {
  IconCollapse,
  IconPlusCircle,
  IconSort,
  IconSliders,
  IconDrag,
  IconShare,
  IconDownload,
} from 'hds-react/icons/';
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
import { resetProject, setMode } from '@/reducers/projectSlice';
import { useNavigate } from 'react-router-dom';

const PlanningToolbar = () => {
  const dispatch = useAppDispatch();
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const [toolbarState, setToolbarState] = useState({
    groupDialogVisible: false,
    projectProgrammedDialogVisible: false,
  });

  const groupsExpandIcon = useMemo(
    () => (groupsExpanded ? <IconCollapse /> : <IconSort />),
    [groupsExpanded],
  );
  const plusIcon = useMemo(() => <IconPlusCircle />, []);
  const slidersIcon = useMemo(() => <IconSliders />, []);
  const dragIcon = useMemo(() => <IconDrag />, []);
  const shareIcon = useMemo(() => <IconShare />, []);
  const downloadIcon = useMemo(() => <IconDownload />, []);

  const { groupDialogVisible, projectProgrammedDialogVisible } = toolbarState;
  const navigate = useNavigate();
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

  const onOpenNewProjectForm = useCallback(() => {
    dispatch(resetProject());
    dispatch(setMode('new'));
    navigate('/project/new');
  }, [dispatch, navigate]);

  // Open the custom context menu for editing the project phase on click
  const handleNewItemMenu = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.NEW_ITEM,
        newItemsMenuProps: {
          onShowProjectProgrammedDialog,
          onShowGroupDialog,
          onOpenNewProjectForm,
        },
      });
    },
    [onShowGroupDialog, onShowProjectProgrammedDialog, onOpenNewProjectForm],
  );

  return (
    <Toolbar
      left={
        <>
          <div className="planning-toolbar-left">
            {/* Manage */}
            <Button
              variant="supplementary"
              className="toolbar-button"
              iconLeft={slidersIcon}
              disabled={true}
            >
              {t('manage')}
            </Button>
            {/* Expand groups */}
            <Button
              onClick={toggleGroupsExpanded}
              variant="supplementary"
              className="expand-groups-button toolbar-button"
              iconLeft={groupsExpandIcon}
            >
              {groupsExpanded ? t(`closeAllGroups`) || '' : t('openAllGroups') || ''}
            </Button>
            {/* Organize */}
            <Button
              variant="supplementary"
              className="toolbar-button"
              iconLeft={dragIcon}
              disabled={true}
            >
              {t('organize')}
            </Button>
            {/* New item */}
            <Button
              variant="supplementary"
              className="toolbar-button"
              iconLeft={plusIcon}
              data-testid="open-new-item-context-menu"
              onMouseDown={handleNewItemMenu}
            >
              {t('new')}
            </Button>
            {/* Save version */}
            <Button
              variant="supplementary"
              className="toolbar-button"
              iconLeft={downloadIcon}
              disabled={true}
            >
              {t('saveVersion')}
            </Button>
            {/* Share version */}
            <Button
              variant="supplementary"
              className="toolbar-button"
              iconLeft={shareIcon}
              disabled={true}
            >
              {t('shareVersion')}
            </Button>
            <GroupDialog
              isOpen={groupDialogVisible}
              handleClose={onCloseGroupDialog}
              editMode={false}
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
