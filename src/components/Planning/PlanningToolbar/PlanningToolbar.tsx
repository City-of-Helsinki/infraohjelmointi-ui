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
import { ILocation } from '@/interfaces/locationInterfaces';
import { IClass } from '@/interfaces/classInterfaces';
import { selectCoordinationDistricts, selectPlanningDistricts } from '@/reducers/locationSlice';
import { IPlanningRowSelections } from '@/interfaces/planningInterfaces';

interface IPlanningSearchParams {
  masterClass?: string;
  class?: string;
  subClass?: string;
  collectiveSubLevel?: string;
  otherClassification?: string;
  otherClassificationSubLevel?: string;
  district?: string;
  subLevelDistrict?: string;
}

const getRelatedItem = (
  relatedItem?: IClass | ILocation | null,
  items?: Array<IClass> | Array<ILocation>,
) => {
  if (items && relatedItem) {
    return items?.filter((i) => i.relatedTo === relatedItem?.id)[0];
  }
};

const getParent = (child: IClass | ILocation, parents: Array<IClass> | Array<ILocation>) =>
  parents.filter((p) => p.id === child.parent)[0];

const buildUrl = (path: 'planning' | 'coordination', params: IPlanningSearchParams) => {
  const queryParams = new URLSearchParams(params as Record<string, string>);
  return `/${path}?${queryParams.toString()}`;
};

const getCoordinationDistrictForSubClass = (
  selectedSubClass: IClass | null,
  planningDistricts: Array<ILocation>,
  coordinationDistricts: Array<ILocation>,
) => {
  // Add a selected district using the subClass if the subClasses name is 'suurpiiri'
  if (selectedSubClass && selectedSubClass.name.toLocaleLowerCase().includes('suurpiiri')) {
    const planningDistrictForSubClass = planningDistricts.find((d) => {
      return d.parentClass === selectedSubClass?.id;
    });

    const coordinationDistrictForSubClass = coordinationDistricts.find((d) => {
      return d.relatedTo === planningDistrictForSubClass?.id;
    });

    return coordinationDistrictForSubClass;
  }
};

const getLowestSelectedClass = (
  allClasses: Array<IClass>,
  selections: IPlanningRowSelections,
  coordinationDistrictForSubClass?: ILocation,
) => {
  if (coordinationDistrictForSubClass) {
    return allClasses.find((ac) => ac.id === coordinationDistrictForSubClass?.parentClass);
  } else {
    const { selectedMasterClass, selectedClass, selectedSubClass } = selections;

    return getRelatedItem(selectedSubClass || selectedClass || selectedMasterClass, allClasses);
  }
};

const PlanningToolbar = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectPlanningMode);
  const groupsExpanded = useAppSelector(selectGroupsExpanded);
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

  const moveToForcedToFrameView = () => {
    const {
      masterClasses,
      classes,
      subClasses,
      collectiveSubLevels,
      otherClassifications,
      otherClassificationSubLevels,
      allClasses,
    } = coordinationClasses;

    const { selectedSubClass } = selections;

    // Navigate to coordination view to its corresponding level if the planning view mode is 'planning'
    if (mode === 'planning') {
      const params: IPlanningSearchParams = {};

      // Get the district using the selectedSubClass if the subClasses name includes 'suurpiiri'
      const coordinationDistrictForSubClass = getCoordinationDistrictForSubClass(
        selectedSubClass,
        planningDistricts,
        coordinationDistricts,
      );

      // Find the lowest selected class using either the coordinationDistrictForSubClass or the search param selections
      const findClass = (classesToFilter: Array<IClass>) => {
        const lowestSelectedClass = getLowestSelectedClass(
          allClasses,
          selections,
          coordinationDistrictForSubClass,
        );
        const foundClass = classesToFilter.find((i) => i.id === lowestSelectedClass?.id);
        return foundClass;
      };

      // We make sure not to iterate over unnecessary levels if the lowest level is found
      const otherClassificationSubLevel = findClass(otherClassificationSubLevels);
      const otherClassification = !otherClassificationSubLevel && findClass(otherClassifications);
      const collectiveSubLevel = !otherClassification && findClass(collectiveSubLevels);
      const coordinationSubClass = !collectiveSubLevel && findClass(subClasses);
      const coordinationClass = !coordinationSubClass && findClass(classes);
      const coordinationMasterClass = !coordinationClass && findClass(masterClasses);

      // Apply search params to the url from the highest level downwards
      if (otherClassificationSubLevel) {
        const otherClassification = getParent(otherClassificationSubLevel, otherClassifications);
        const collectiveSubLevel = getParent(otherClassification, collectiveSubLevels);
        const coordinationSubClass = getParent(collectiveSubLevel, subClasses);
        const coordinationClass = getParent(coordinationSubClass, classes);
        const coordinationMasterClass = getParent(coordinationClass, masterClasses);

        params.masterClass = coordinationMasterClass.id;
        params.class = coordinationClass.id;
        params.subClass = coordinationSubClass.id;
        params.collectiveSubLevel = collectiveSubLevel.id;
        params.otherClassification = otherClassification.id;
        params.otherClassificationSubLevel = otherClassificationSubLevel.id;
      } else if (otherClassification) {
        const collectiveSubLevel = getParent(otherClassification, collectiveSubLevels);
        const coordinationSubClass = getParent(collectiveSubLevel, subClasses);
        const coordinationClass = getParent(coordinationSubClass, classes);
        const coordinationMasterClass = getParent(coordinationClass, masterClasses);

        params.masterClass = coordinationMasterClass.id;
        params.class = coordinationClass.id;
        params.subClass = coordinationSubClass.id;
        params.collectiveSubLevel = collectiveSubLevel.id;
        params.otherClassification = otherClassification.id;
      } else if (collectiveSubLevel) {
        const coordinationSubClass = getParent(collectiveSubLevel, subClasses);
        const coordinationClass = getParent(coordinationSubClass, classes);
        const coordinationMasterClass = getParent(coordinationClass, masterClasses);

        params.masterClass = coordinationMasterClass.id;
        params.class = coordinationClass.id;
        params.subClass = coordinationSubClass.id;
        params.collectiveSubLevel = collectiveSubLevel.id;
      } else if (coordinationSubClass) {
        const coordinationClass = getParent(coordinationSubClass, classes);
        const coordinationMasterClass = getParent(coordinationClass, masterClasses);

        params.masterClass = coordinationMasterClass.id;
        params.class = coordinationClass.id;
        params.subClass = coordinationSubClass.id;
      } else if (coordinationClass) {
        const coordinationMasterClass = getParent(coordinationClass, masterClasses);

        params.masterClass = coordinationMasterClass.id;
        params.class = coordinationClass.id;
      } else if (coordinationMasterClass) {
        params.masterClass = coordinationMasterClass.id;
      }

      // Set the district as 'subLevelDistrict' if it appears alongside a 'collectiveSubLevel'
      if (coordinationDistrictForSubClass) {
        params[collectiveSubLevel ? 'subLevelDistrict' : 'district'] =
          coordinationDistrictForSubClass?.id;
      }

      navigate(buildUrl('coordination', params));

      dispatch(setForcedToFrame(true));
    }
  };

  const moveToIdealView = () => {
    const { masterClasses, classes, subClasses, allClasses } = planningClasses;

    const {
      selectedMasterClass,
      selectedClass,
      selectedSubClass,
      selectedDistrict,
      selectedCollectiveSubLevel,
      selectedOtherClassification,
      selectedSubLevelDistrict,
    } = selections;

    const params: IPlanningSearchParams = {};

    const planningDistrict = planningDistricts.find(
      (pd) =>
        pd.id === selectedDistrict?.relatedTo || pd.id === selectedSubLevelDistrict?.relatedTo,
    );

    const districtsParent = allClasses.find((ac) => ac.id === planningDistrict?.parentClass);

    if (districtsParent?.name.toLocaleLowerCase().includes('suurpiiri')) {
      params.subClass = districtsParent.id;
    } else if (planningDistrict) {
      params.district = planningDistrict?.id;
    }

    const lowestSelectedClass =
      selectedOtherClassification ||
      selectedCollectiveSubLevel ||
      selectedSubClass ||
      selectedClass ||
      selectedMasterClass;

    // Find the lowest selected class using either the coordinationDistrictForSubClass or the search param selections
    const findClass = (classesToFilter: Array<IClass>) => {
      const foundClass = classesToFilter.find((ctf) => ctf.id === lowestSelectedClass?.relatedTo);
      return foundClass;
    };

    const planningSubClass = !params.subClass && findClass(subClasses);
    const planningClass = !planningSubClass && findClass(classes);
    const planningMasterClass = !planningClass && findClass(masterClasses);

    if (planningSubClass) {
      const planningClass = getParent(planningSubClass, classes);
      params.masterClass = getParent(planningClass, masterClasses).id;
      params.class = planningClass.id;
      params.subClass = planningSubClass.id;
    } else if (planningClass) {
      params.masterClass = getParent(planningClass, masterClasses).id;
      params.class = planningClass.id;
    } else if (planningMasterClass) {
      params.masterClass = planningMasterClass.id;
    }

    console.log('planning sub class: ', planningSubClass);
    console.log('planning class: ', planningClass);
    console.log('planning master class: ', planningMasterClass);

    console.log('districts parent: ', districtsParent);
    console.log('planning district: ', planningDistrict);
    console.log('lowest selected class: ', lowestSelectedClass);

    console.log('params: ', params);

    navigate(buildUrl('planning', params));

    dispatch(setForcedToFrame(false));
  };

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
        <div>
          <button
            aria-label="ideal budget view"
            className={`money-button ${!forcedToFrame ? 'selected' : ''}`}
            disabled={!forcedToFrame}
            onClick={moveToIdealView}
          >
            <IconMoneyBag />
          </button>
          <button
            aria-label="force framed budget view"
            className={`money-button ${forcedToFrame ? 'selected' : ''}`}
            disabled={forcedToFrame}
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
