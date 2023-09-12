import {
  selectBatchedCoordinationClasses,
  selectBatchedForcedToFrameClasses,
} from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import {
  selectBatchedCoordinationLocations,
  selectBatchedForcedToFrameLocations,
} from '@/reducers/locationSlice';
import { useEffect } from 'react';
import {
  IPlanningRow,
  IPlanningRowList,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/planningInterfaces';
import { selectGroups } from '@/reducers/groupSlice';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  selectForcedToFrame,
  selectPlanningMode,
  selectPlanningRows,
  selectProjects,
  selectSelections,
  setPlanningRows,
  setProjects,
} from '@/reducers/planningSlice';
import {
  buildPlanningRow,
  fetchProjectsByRelation,
  getSelectedOrAll,
  getTypeAndIdForLowestExpandedRow,
} from '@/utils/planningRowUtils';
import _ from 'lodash';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';

/**
 * Builds a hierarchy-list of IPlanningTableRows
 */
const buildCoordinatorTableRows = (
  list: IPlanningRowList,
  projects: Array<IProject>,
  selections: IPlanningRowSelections,
) => {
  const {
    masterClasses,
    classes,
    subClasses,
    collectiveSubLevels,
    districts,
    otherClassifications,
    otherClassificationSubLevels,
  } = list;

  const {
    selectedMasterClass,
    selectedClass,
    selectedSubClass,
    selectedDistrict,
    selectedCollectiveSubLevel,
    selectedSubLevelDistrict,
    selectedOtherClassification,
  } = selections;

  const getRow = ({
    item,
    type,
    expanded,
  }: {
    item: IClass | ILocation;
    type: PlanningRowType;
    expanded?: boolean;
  }) =>
    buildPlanningRow({
      item,
      type,
      projects,
      expanded,
      districtsForSubClass: [],
      isCoordinator: true,
    });

  const districtsBeforeCollectiveSubLevel = !selectedCollectiveSubLevel ? districts : [];
  const districtsAfterCollectiveSubLevel = !selectedOtherClassification ? districts : [];

  const getDistrictRowsForParent = ({
    type,
    expanded,
    parent,
    districts,
  }: {
    type: PlanningRowType;
    parent: IClass | ILocation;
    expanded?: boolean;
    districts: Array<ILocation>;
  }) => {
    const filteredDistricts = districts.filter((district) => district.parentClass === parent.id);
    return filteredDistricts.map((filteredDistrict) => ({
      ...getRow({
        item: filteredDistrict,
        type,
        expanded: !!expanded,
      }),
    }));
  };

  // Map the class rows going from masterClasses to otherClassificationSubLevels
  const rows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
    const masterClassRow = getRow({
      item: masterClass,
      type: 'masterClass',
      expanded: !!selectedMasterClass,
    });
    const filteredClasses = classes.filter((c) => c.parent === masterClass.id);
    return {
      ...masterClassRow,
      children: filteredClasses.map((filteredClass) => {
        const classRow = getRow({
          item: filteredClass,
          type: 'class',
          expanded: !!selectedClass,
        });
        const filteredSubClasses = subClasses.filter(
          (subClass) => subClass.parent === filteredClass.id,
        );
        return {
          ...classRow,
          children: filteredSubClasses.map((filteredSubClass) => {
            const subClassRow = getRow({
              item: filteredSubClass,
              type: 'subClass',
              expanded: !!selectedSubClass,
            });
            const filteredCollectiveSubLevels = collectiveSubLevels.filter(
              (collectiveSubLevel) => collectiveSubLevel.parent === filteredSubClass.id,
            );
            return {
              ...subClassRow,
              children: [
                ...filteredCollectiveSubLevels.map((filteredCollectiveSubLevel) => {
                  const collectiveSubLevelRow = getRow({
                    item: filteredCollectiveSubLevel,
                    type: 'collectiveSubLevel',
                    expanded: !!selectedCollectiveSubLevel,
                  });

                  const filteredOtherClassifications = otherClassifications.filter(
                    (otherClassification) =>
                      otherClassification.parent === filteredCollectiveSubLevel.id,
                  );

                  return {
                    ...collectiveSubLevelRow,
                    children: [
                      ...filteredOtherClassifications.map((filteredOtherClassification) => {
                        const otherClassificationRow = getRow({
                          item: filteredOtherClassification,
                          type: 'otherClassification',
                          expanded: !!selectedOtherClassification,
                        });
                        const filteredOtherClassificationSubLevels =
                          otherClassificationSubLevels.filter(
                            (otherClassificationSubLevel) =>
                              otherClassificationSubLevel.parent === filteredOtherClassification.id,
                          );
                        return {
                          ...otherClassificationRow,
                          children: filteredOtherClassificationSubLevels.map(
                            (filteredOtherClassificationSubLevel) => {
                              const otherClassificationSubLevelRow = getRow({
                                item: filteredOtherClassificationSubLevel,
                                type: 'otherClassificationSubLevel',
                              });
                              return {
                                ...otherClassificationSubLevelRow,
                              };
                            },
                          ),
                        };
                      }),
                      // Districts that come after a collectiveSubLevel
                      ...getDistrictRowsForParent({
                        type: 'subLevelDistrict',
                        expanded: !!selectedSubLevelDistrict,
                        parent: filteredCollectiveSubLevel,
                        districts: districtsAfterCollectiveSubLevel,
                      }),
                    ],
                  };
                }),
                // Districts that come after a subClass
                ...getDistrictRowsForParent({
                  type: 'districtPreview',
                  expanded: !!selectedDistrict,
                  parent: filteredSubClass,
                  districts: districtsBeforeCollectiveSubLevel,
                }),
              ],
            };
          }),
        };
      }),
    };
  });

  return rows;
};

/**
 * Populates redux planning slice with data needed to render the planning view. This is done to prevent the need to
 * re-iterate the planning rows each time the user navigates back end forth between the planning table and the project basics form.
 *
 * Creates a row hierarchy of masterClasses, classes, subClasses, districts and divisions for the PlanningTable
 *
 * It also listens to the url params for a masterClassId, classId, subClassId or districtId which it will
 * use to return the currently selected (opened/expanded) rows.
 *
 * @returns IPlanningRowsState
 */
const useCoordinationRows = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const rows = useAppSelector(selectPlanningRows);
  const projects = useAppSelector(selectProjects);
  const selections = useAppSelector(selectSelections);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const batchedCoordinationClasses = useAppSelector(selectBatchedCoordinationClasses);
  const batchedCoordinationLocations = useAppSelector(selectBatchedCoordinationLocations);
  const batchedForcedToFrameClasses = useAppSelector(selectBatchedForcedToFrameClasses);
  const batchedForcedToFrameLocations = useAppSelector(selectBatchedForcedToFrameLocations);

  const mode = useAppSelector(selectPlanningMode);

  // Fetch projects when selections change
  useEffect(() => {
    if (mode !== 'coordination') {
      return;
    }

    const { type, id } = getTypeAndIdForLowestExpandedRow(selections);

    if (type && id) {
      fetchProjectsByRelation(type as PlanningRowType, id, forcedToFrame, true)
        .then((res) => {
          dispatch(setProjects(res));
        })
        .catch(Promise.reject);
    }
  }, [selections, groups, mode, forcedToFrame]);

  /**
   * We use coordinator values (classes and locations) when forced to frame is false.
   *
   * Build coordinator table rows when locations, classes, groups, project, mode or selections change.
   */
  useEffect(() => {
    if (mode !== 'coordination' || forcedToFrame) {
      return;
    }

    console.log('building rows');

    const {
      masterClasses,
      classes,
      subClasses,
      collectiveSubLevels,
      otherClassifications,
      otherClassificationSubLevels,
    } = batchedCoordinationClasses;

    const { districts } = batchedCoordinationLocations;

    const {
      selectedClass,
      selectedDistrict,
      selectedMasterClass,
      selectedSubClass,
      selectedCollectiveSubLevel,
      selectedOtherClassification,
      selectedSubLevelDistrict,
    } = selections;

    const isAnyDistrictSelected = selectedDistrict ?? selectedSubLevelDistrict;
    const finalCollectiveSubLevels = [];
    const finalOtherClassification = [];

    // It's unnecessary to pass the collectiveSubLevels or otherClassifications if there is a selectedDistrict
    if (!isAnyDistrictSelected) {
      finalOtherClassification.push(
        ...getSelectedOrAll(selectedOtherClassification, otherClassifications),
      );
    }

    if (!selectedDistrict) {
      finalCollectiveSubLevels.push(
        ...getSelectedOrAll(selectedCollectiveSubLevel, collectiveSubLevels),
      );
    }

    const list = {
      masterClasses: getSelectedOrAll(selectedMasterClass, masterClasses),
      classes: getSelectedOrAll(selectedClass, classes),
      subClasses: getSelectedOrAll(selectedSubClass, subClasses),
      districts: getSelectedOrAll(isAnyDistrictSelected, districts) as Array<ILocation>,
      collectiveSubLevels: finalCollectiveSubLevels,
      otherClassifications: finalOtherClassification,
      otherClassificationSubLevels: otherClassificationSubLevels,
      divisions: [],
      groups: [],
    };

    const nextRows = buildCoordinatorTableRows(list, projects, selections);

    // Re-build planning rows if the existing rows are not equal
    if (!_.isEqual(nextRows, rows)) {
      dispatch(setPlanningRows(nextRows));
    }
  }, [
    batchedCoordinationClasses,
    batchedCoordinationLocations,
    groups,
    projects,
    selections,
    mode,
  ]);

  /**
   * We use forced to frame values (classes and locations) when forced to frame is true.
   *
   * Build forced to frame table rows when locations, classes, groups, project, mode or selections change.
   */
  useEffect(() => {
    if (mode !== 'coordination' || !forcedToFrame) {
      return;
    }

    const {
      masterClasses,
      classes,
      subClasses,
      collectiveSubLevels,
      otherClassifications,
      otherClassificationSubLevels,
    } = batchedForcedToFrameClasses;

    const { districts } = batchedForcedToFrameLocations;

    const {
      selectedClass,
      selectedDistrict,
      selectedMasterClass,
      selectedSubClass,
      selectedCollectiveSubLevel,
      selectedOtherClassification,
      selectedSubLevelDistrict,
    } = selections;

    const isAnyDistrictSelected = selectedDistrict ?? selectedSubLevelDistrict;
    const finalCollectiveSubLevels = [];
    const finalOtherClassification = [];

    // It's unnecessary to pass the collectiveSubLevels or otherClassifications if there is a selectedDistrict
    if (!isAnyDistrictSelected) {
      finalOtherClassification.push(
        ...getSelectedOrAll(selectedOtherClassification, otherClassifications),
      );
    }

    if (!selectedDistrict) {
      finalCollectiveSubLevels.push(
        ...getSelectedOrAll(selectedCollectiveSubLevel, collectiveSubLevels),
      );
    }

    const list = {
      masterClasses: getSelectedOrAll(selectedMasterClass, masterClasses),
      classes: getSelectedOrAll(selectedClass, classes),
      subClasses: getSelectedOrAll(selectedSubClass, subClasses),
      districts: getSelectedOrAll(isAnyDistrictSelected, districts) as Array<ILocation>,
      collectiveSubLevels: finalCollectiveSubLevels,
      otherClassifications: finalOtherClassification,
      otherClassificationSubLevels: otherClassificationSubLevels,
      divisions: [],
      groups: [],
    };

    const nextRows = buildCoordinatorTableRows(list, projects, selections);

    // Re-build planning rows if the existing rows are not equal
    if (!_.isEqual(nextRows, rows)) {
      dispatch(setPlanningRows(nextRows));
    }
  }, [
    batchedForcedToFrameClasses,
    batchedForcedToFrameLocations,
    groups,
    projects,
    selections,
    mode,
  ]);
};

export default useCoordinationRows;
