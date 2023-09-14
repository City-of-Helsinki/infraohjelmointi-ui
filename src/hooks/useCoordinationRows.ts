import {
  ICoordinatorClassHierarchy,
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
import { selectCoordinationGroups } from '@/reducers/groupSlice';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  selectForcedToFrame,
  selectPlanningMode,
  selectPlanningRows,
  selectProjects,
  selectSelections,
  selectStartYear,
  setPlanningRows,
  setProjects,
} from '@/reducers/planningSlice';
import {
  buildPlanningRow,
  fetchProjectsByRelation,
  getSelectedOrAll,
  getTypeAndIdForLowestExpandedRow,
  sortByName,
} from '@/utils/planningRowUtils';
import _ from 'lodash';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IGroup } from '@/interfaces/groupInterfaces';

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
    groups,
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
    item: IClass | ILocation | IGroup;
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

  // groups can be mapped under subclass, collectiveSubLevel, otherClassification or subLevelDistrict or district
  const getSortedGroupRows = (id: string, type: PlanningRowType) => {
    const filteredGroups = [];

    if (type === 'subClass' || type === 'collectiveSubLevel' || type === 'otherClassification') {
      filteredGroups.push(
        ...groups.filter((group) => group.classRelation === id && !group.locationRelation),
      );
    }
    // Filter groups under subClass-preview only if there are is no locationRelation
    else if (type === 'district' || type === 'subLevelDistrict') {
      filteredGroups.push(...groups.filter((group) => group.locationRelation === id));
    }
    
    return sortByName(filteredGroups).map((group) => ({
      ...getRow({
        item: group as IGroup,
        type: 'group',
        expanded: true,
      }),
    }));
  };

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
      children: getSortedGroupRows(filteredDistrict.id, type),
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
                ...getSortedGroupRows(filteredSubClass.id, 'subClass'),
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
                      ...getSortedGroupRows(filteredCollectiveSubLevel.id, 'collectiveSubLevel'),
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
                          children: [
                            ...getSortedGroupRows(
                              filteredOtherClassification.id,
                              'otherClassification',
                            ),
                            ...filteredOtherClassificationSubLevels.map(
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
                          ],
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

const getCoordinationTableRows = (
  allClasses: ICoordinatorClassHierarchy,
  districts: Array<ILocation>,
  selections: IPlanningRowSelections,
  projects: Array<IProject>,
) => {
  const {
    masterClasses,
    classes,
    subClasses,
    collectiveSubLevels,
    otherClassifications,
    otherClassificationSubLevels,
  } = allClasses;

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

  const coordinationRows = buildCoordinatorTableRows(list, projects, selections);

  return coordinationRows;
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
  const groups = useAppSelector(selectCoordinationGroups);
  const rows = useAppSelector(selectPlanningRows);
  const projects = useAppSelector(selectProjects);
  const startYear = useAppSelector(selectStartYear);
  const selections = useAppSelector(selectSelections);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const batchedCoordinationClasses = useAppSelector(selectBatchedCoordinationClasses);
  const batchedCoordinationLocations = useAppSelector(selectBatchedCoordinationLocations);
  const batchedForcedToFrameClasses = useAppSelector(selectBatchedForcedToFrameClasses);
  const batchedForcedToFrameLocations = useAppSelector(selectBatchedForcedToFrameLocations);

  const mode = useAppSelector(selectPlanningMode);

  // Fetch projects when selections change
  useEffect(() => {
    // Don't fetch projects if mode isn't coordinator or the selections are the same as previously
    if (mode !== 'coordination') {
      return;
    }

    const year = startYear ?? new Date().getFullYear();
    const { type, id } = getTypeAndIdForLowestExpandedRow(selections);

    const getAndSetProjectsForSelections = async (type: PlanningRowType, id: string) => {
      try {
        const projects = await fetchProjectsByRelation(
          type as PlanningRowType,
          id,
          forcedToFrame,
          year,
          true,
        );
        dispatch(setProjects(projects));
      } catch (e) {
        console.log('Error fetching projects for coordination selections: ', e);
      }
    };

    if (type && id) {
      getAndSetProjectsForSelections(type as PlanningRowType, id);
    }
  }, [selections, groups, mode, forcedToFrame]);

  /**
   * We use coordinator or forced to frame values (classes and locations).
   *
   * Build coordinator table rows when locations, classes, groups, project, mode or selections change.
   */
  useEffect(() => {
    if (mode !== 'coordination') {
      return;
    }

    const allClasses = forcedToFrame ? batchedForcedToFrameClasses : batchedCoordinationClasses;
    const districts = forcedToFrame
      ? batchedForcedToFrameLocations.districts
      : batchedCoordinationLocations.districts;

    const nextRows = getCoordinationTableRows(allClasses, districts, selections, projects);

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
};

export default useCoordinationRows;
