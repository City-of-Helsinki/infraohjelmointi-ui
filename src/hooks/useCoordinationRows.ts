import { selectBatchedCoordinationClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectBatchedCoordinationLocations } from '@/reducers/locationSlice';
import { useEffect } from 'react';
import {
  IPlanningRow,
  IPlanningRowList,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/common';
import { selectGroups } from '@/reducers/groupSlice';
import { IProject } from '@/interfaces/projectInterfaces';
import {
  selectMode,
  selectPlanningRows,
  selectProjects,
  selectSelections,
  setPlanningRows,
} from '@/reducers/planningSlice';
import { buildPlanningRow, getSelectedOrAll } from '@/utils/planningRowUtils';
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

  const { selectedMasterClass, selectedClass, selectedSubClass } = selections;

  const getRow = (item: IClass | ILocation, type: PlanningRowType, defaultExpanded?: boolean) =>
    buildPlanningRow(item, type, projects, defaultExpanded);

  // Map the class rows going from masterClasses to districts
  const rows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
    return {
      // MASTER CLASSES
      ...getRow(masterClass, 'masterClass', !!selectedMasterClass),
      // CLASSES
      children: classes
        .filter((c) => c.parent === masterClass.id)
        .map((filteredClass) => ({
          ...getRow(filteredClass, 'class', !!selectedClass),
          // SUB CLASSES
          children: subClasses
            .filter((subClass) => subClass.parent === filteredClass.id)
            .map((filteredSubClass) => ({
              ...getRow(filteredSubClass, 'subClass', !!selectedSubClass),
              // COLLECTIVE SUB LEVELS
              children: [
                ...collectiveSubLevels
                  .filter((collectiveSubLevel) => collectiveSubLevel.parent === filteredSubClass.id)
                  .map((filteredCollectiveSubLevel) => ({
                    ...getRow(filteredCollectiveSubLevel, 'collectiveSubLevel'),
                    // OTHER CLASSIFICATIONS & COLLECTIVE DISTRICTS
                    children: [
                      // other classifications
                      ...otherClassifications
                        .filter(
                          (otherClassification) =>
                            otherClassification.parent === filteredCollectiveSubLevel.id,
                        )
                        .map((filteredOtherClassification) => ({
                          ...getRow(filteredOtherClassification, 'otherClassification'),
                          // OTHER CLASSIFICATION SUB LEVELS
                          children: otherClassificationSubLevels
                            .filter(
                              (otherClassificationSubLevel) =>
                                otherClassificationSubLevel.parent ===
                                filteredOtherClassification.id,
                            )
                            .map((filteredOtherClassificationSubLevel) => ({
                              ...getRow(
                                filteredOtherClassificationSubLevel,
                                'otherClassificationSubLevel',
                              ),
                            })),
                        })),
                      // districts
                      ...districts
                        .filter(
                          (district) => district.parentClass === filteredCollectiveSubLevel.id,
                        )
                        .map((filteredDistrict) => ({
                          ...getRow(filteredDistrict, 'collectiveDistrict'),
                        })),
                    ],
                  })),
                // DISTRICTS
                ...districts
                  .filter((district) => district.parentClass === filteredSubClass.id)
                  .map((filteredDistrict) => ({
                    ...getRow(filteredDistrict, 'districtPreview'),
                  })),
              ],
            })),
        })),
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

  const mode = useAppSelector(selectMode);

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
    } = selections;

    const finalDistricts = [];

    if (selectedDistrict) {
      finalDistricts.push(selectedDistrict);
    } else if (!selectedSubClass?.name.toLocaleLowerCase().includes('suurpiiri')) {
      finalDistricts.push(...districts);
    }

    const list = {
      masterClasses: getSelectedOrAll(selectedMasterClass, masterClasses),
      classes: getSelectedOrAll(selectedClass, classes),
      subClasses: getSelectedOrAll(selectedSubClass, subClasses),
      collectiveSubLevels: getSelectedOrAll(selectedCollectiveSubLevel, collectiveSubLevels),
      districts: finalDistricts,
      otherClassifications: getSelectedOrAll(selectedOtherClassification, otherClassifications),
      otherClassificationSubLevels: otherClassificationSubLevels,
      divisions: [],
      groups: [],
    };

    const nextRows = buildCoordinatorTableRows(list, projects, selections);

    // Re-build planning rows if the existing rows are not equal
    if (!_.isEqual(nextRows, rows)) {
      dispatch(setPlanningRows(nextRows));
    }
  }, [batchedCoordinationClasses, groups, projects, selections, mode]);
};

export default useCoordinationRows;
