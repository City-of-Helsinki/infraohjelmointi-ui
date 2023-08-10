import { Toolbar } from '../../shared';
import {
  IconCollapse,
  IconPlusCircle,
  IconSort,
  IconSliders,
  IconDrag,
  IconShare,
  IconDownload,
  IconMoneyBag,
  IconMoneyBagFill,
} from 'hds-react/icons/';
import { useCallback, MouseEvent as ReactMouseEvent, useState, memo, useMemo } from 'react';
import { dispatchContextMenuEvent } from '@/utils/events';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import { Button } from 'hds-react/components/Button';
import { GroupDialog } from '../GroupDialog';
import { ProjectProgrammedDialog } from '../ProjectProgrammedDialog';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  selectForcedToFrame,
  selectGroupsExpanded,
  selectPlanningMode,
  selectSelectedYear,
  selectSelections,
  setForcedToFrame,
  setGroupsExpanded,
} from '@/reducers/planningSlice';
import { t } from 'i18next';
import './styles.css';
import { resetProject, setProjectMode } from '@/reducers/projectSlice';
import { useNavigate } from 'react-router-dom';
import {
  selectBatchedCoordinationClasses,
  selectBatchedPlanningClasses,
} from '@/reducers/classSlice';
import { selectCoordinationDistricts, selectPlanningDistricts } from '@/reducers/locationSlice';
import {
  getCoordinationUrlFromPlanningSelections,
  getPlanningUrlFromCoordinationSelections,
} from '@/utils/planningRowUtils';

const PlanningToolbar = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectPlanningMode);
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
  const selectedYear = useAppSelector(selectSelectedYear);
  const [toolbarState, setToolbarState] = useState({
    groupDialogVisible: false,
    projectProgrammedDialogVisible: false,
  });

  const coordinationClasses = useAppSelector(selectBatchedCoordinationClasses);
  const coordinationDistricts = useAppSelector(selectCoordinationDistricts);
  const planningDistricts = useAppSelector(selectPlanningDistricts);
  const planningClasses = useAppSelector(selectBatchedPlanningClasses);
  const selections = useAppSelector(selectSelections);
  const forcedToFrame = useAppSelector(selectForcedToFrame);

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
    dispatch(setProjectMode('new'));
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

  /**
   * Construct a url for the coordination view that has the converted search params
   * from planning levels to coordination levels and set forced to frame to true
   */
  const moveToForcedToFrameView = useCallback(() => {
    const coordinationUrl = getCoordinationUrlFromPlanningSelections(
      coordinationClasses,
      coordinationDistricts,
      planningDistricts,
      selections,
    );

    navigate(coordinationUrl);
    dispatch(setForcedToFrame(true));
  }, [
    coordinationClasses,
    coordinationDistricts,
    dispatch,
    navigate,
    planningDistricts,
    selections,
  ]);

  /**
   * Construct a url for the planning view that has the converted search params
   * from coordinator levels to planning levels and set forced to frame to false
   */
  const moveToIdealView = useCallback(() => {
    const planningUrl = getPlanningUrlFromCoordinationSelections(
      planningClasses,
      planningDistricts,
      selections,
    );

    navigate(planningUrl);
    dispatch(setForcedToFrame(false));
  }, [dispatch, navigate, planningClasses, planningDistricts, selections]);

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
              disabled={mode === 'coordination'}
              data-testid="expand-groups-button"
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
              data-testid="new-item-button"
              onMouseDown={handleNewItemMenu}
              disabled={mode === 'coordination'}
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
      right={
        <div className={`planning-toolbar-right ${selectedYear ? 'monthly-view-open' : ''}`}>
          <button
            aria-label="ideal budget view"
            className={`money-button ${!forcedToFrame ? 'selected' : ''}`}
            disabled={!forcedToFrame || mode === 'planning'}
            onClick={moveToIdealView}
          >
            <IconMoneyBag />
          </button>
          <button
            aria-label="force framed budget view"
            className={`money-button ${forcedToFrame ? 'selected' : ''}`}
            disabled={forcedToFrame || mode === 'coordination'}
            onClick={moveToForcedToFrameView}
          >
            <IconMoneyBagFill />
          </button>
        </div>
      }
    />
  );
};

export default memo(PlanningToolbar);
