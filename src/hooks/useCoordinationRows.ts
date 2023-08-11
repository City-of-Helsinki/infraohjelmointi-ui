import { selectBatchedCoordinationClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectBatchedCoordinationLocations } from '@/reducers/locationSlice';
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
    siblings,
    parentRow,
    expanded,
  }: {
    item: IClass | ILocation;
    type: PlanningRowType;
    siblings: Array<IClass> | Array<ILocation>;
    parentRow: IPlanningRow | null;
    expanded?: boolean;
  }) =>
    buildPlanningRow({
      item,
      type,
      projects,
      expanded,
      districtsForSubClass: [],
      isCoordinator: true,
      siblings,
      parentRow,
    });

  const districtsBeforeCollectiveSubLevel = !selectedCollectiveSubLevel ? districts : [];
  const districtsAfterCollectiveSubLevel = !selectedOtherClassification ? districts : [];

  const getDistrictRowsForParent = (
    parent: IClass,
    districts: Array<ILocation>,
    defaultExpanded: boolean,
    type: PlanningRowType,
  ) =>
    districts
      .filter((district) => district.parentClass === parent.id)
      // TODO: add siblings and parentRow here?
      .map((filteredDistrict) => ({
        ...getRow({
          item: filteredDistrict,
          type,
          siblings: [],
          parentRow: null,
          expanded: !!defaultExpanded,
        }),
      }));

  // Map the class rows going from masterClasses to districts
  const rows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
    const masterClassRow = getRow({
      item: masterClass,
      type: 'masterClass',
      siblings: [],
      parentRow: null,
      expanded: !!selectedMasterClass,
    });
    const filteredClasses = classes.filter((c) => c.parent === masterClass.id);
    return {
      // MASTER CLASSES
      ...masterClassRow,
      // CLASSES
      children: filteredClasses.map((filteredClass) => {
        const classRow = getRow({
          item: filteredClass,
          type: 'class',
          siblings: filteredClasses,
          parentRow: masterClassRow,
          expanded: !!selectedClass,
        });
        const filteredSubClasses = subClasses.filter(
          (subClass) => subClass.parent === filteredClass.id,
        );
        return {
          ...classRow,
          // SUB CLASSES
          children: filteredSubClasses.map((filteredSubClass) => {
            const subClassRow = getRow({
              item: filteredSubClass,
              type: 'subClass',
              siblings: filteredSubClasses,
              parentRow: classRow,
              expanded: !!selectedSubClass,
            });
            const filteredCollectiveSubLevels = collectiveSubLevels.filter(
              (collectiveSubLevel) => collectiveSubLevel.parent === filteredSubClass.id,
            );
            return {
              ...subClassRow,
              // COLLECTIVE SUB LEVELS
              children: [
                ...filteredCollectiveSubLevels.map((filteredCollectiveSubLevel) => {
                  const collectiveSubLevelRow = getRow({
                    item: filteredCollectiveSubLevel,
                    type: 'collectiveSubLevel',
                    siblings: filteredCollectiveSubLevels,
                    parentRow: subClassRow,
                    expanded: !!selectedCollectiveSubLevel,
                  });

                  const filteredOtherClassifications = otherClassifications.filter(
                    (otherClassification) =>
                      otherClassification.parent === filteredCollectiveSubLevel.id,
                  );

                  return {
                    ...collectiveSubLevelRow,
                    // OTHER CLASSIFICATIONS & COLLECTIVE DISTRICTS
                    children: [
                      // other classifications
                      ...filteredOtherClassifications.map((filteredOtherClassification) => {
                        const otherClassificationRow = getRow({
                          item: filteredOtherClassification,
                          type: 'otherClassification',
                          siblings: filteredOtherClassifications,
                          parentRow: collectiveSubLevelRow,
                          expanded: !!selectedOtherClassification,
                        });
                        const filteredOtherClassificationSubLevels =
                          otherClassificationSubLevels.filter(
                            (otherClassificationSubLevel) =>
                              otherClassificationSubLevel.parent === filteredOtherClassification.id,
                          );
                        return {
                          ...otherClassificationRow,
                          // OTHER CLASSIFICATION SUB LEVELS
                          children: filteredOtherClassificationSubLevels.map(
                            (filteredOtherClassificationSubLevel) => {
                              const otherClassificationSubLevelRow = getRow({
                                item: filteredOtherClassificationSubLevel,
                                type: 'otherClassificationSubLevel',
                                siblings: filteredOtherClassificationSubLevels,
                                parentRow: otherClassificationRow,
                              });
                              return {
                                ...otherClassificationSubLevelRow,
                              };
                            },
                          ),
                        };
                      }),
                      // districts
                      ...getDistrictRowsForParent(
                        filteredCollectiveSubLevel,
                        districtsAfterCollectiveSubLevel,
                        !!selectedSubLevelDistrict,
                        'subLevelDistrict',
                      ),
                    ],
                  };
                }),
                // DISTRICTS
                ...getDistrictRowsForParent(
                  filteredSubClass,
                  districtsBeforeCollectiveSubLevel,
                  !!selectedDistrict,
                  'districtPreview',
                ),
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
  const batchedCoordinationClasses = useAppSelector(selectBatchedCoordinationClasses);
  const batchedCoordinationLocations = useAppSelector(selectBatchedCoordinationLocations);

  const mode = useAppSelector(selectPlanningMode);

  // Fetch projects when selections change
  useEffect(() => {
    if (mode !== 'coordination') {
      return;
    }

    const { type, id } = getTypeAndIdForLowestExpandedRow(selections);

    if (type && id) {
      fetchProjectsByRelation(type as PlanningRowType, id, true)
        .then((res) => {
          dispatch(setProjects(res));
        })
        .catch(Promise.reject);
    }
  }, [selections, groups, mode]);

  // Build coordination table rows when locations, classes, groups, project, mode or selections change
  useEffect(() => {
    if (mode !== 'coordination') {
      return;
    }

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
      console.log(nextRows);

      dispatch(setPlanningRows(nextRows));
    }
  }, [batchedCoordinationClasses, groups, projects, selections, mode]);
};

export default useCoordinationRows;
