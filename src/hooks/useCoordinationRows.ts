import { selectBatchedCoordinationClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectBatchedCoordinationLocations } from '@/reducers/locationSlice';
import { useEffect } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import {
  IPlanningRow,
  IPlanningRowList,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/common';
import { selectGroups } from '@/reducers/groupSlice';
import { IGroup } from '@/interfaces/groupInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { calculatePlanningCells, calculatePlanningRowSums } from '@/utils/calculations';
import {
  selectMode,
  selectPlanningRows,
  selectProjects,
  selectSelections,
  setPlanningRows,
} from '@/reducers/planningSlice';
import _ from 'lodash';

/**
 * Builds a hierarchy-list of IPlanningTableRows, that will either include
 * - masterClasses, classes, subClasses, groups and districts; if a district isn't selected
 * - districts, divisions and groups; if a district is selected
 *
 * ! Groups will mostly appear under the selected divisions, but they can also appear under
 * districts and subClasses
 *
 * @param state the current state of the planningRows-hook
 * @returns a list of planning rows for the planning table
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
    // TODO: confirm how the paths are supposed to be before adding the new selections
    // selectedCollectiveSubLevel,
    // selectedDistrict,
    // selectedOtherClassification,
    // selectedOtherClassificationSubLevel,
  } = selections;

  const getRowProps = (
    item: IClass | ILocation | IGroup,
    type: PlanningRowType,
    expanded?: boolean,
  ): IPlanningRow => {
    const defaultExpanded = expanded || type === 'division';
    return {
      type: type,
      name: item.name,
      path: type !== 'group' ? (item as IClass | ILocation).path : '',
      id: item.id,
      key: item.id,
      defaultExpanded,
      children: [],
      projectRows: [],
      cells: calculatePlanningCells(item.finances, type),
      ...calculatePlanningRowSums(item.finances, type),
    };
  };

  // Map the class rows going from masterClasses to districts
  const rows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
    return {
      // Map master classes
      ...getRowProps(masterClass, 'masterClass', !!selectedMasterClass),
      // Map classes
      children: classes
        .filter((c) => c.parent === masterClass.id)
        .map((filteredClass) => ({
          ...getRowProps(filteredClass, 'class', !!selectedClass),
          // Map sub classes
          children: subClasses
            .filter((subClass) => subClass.parent === filteredClass.id)
            .map((filteredSubClass) => ({
              ...getRowProps(filteredSubClass, 'subClass', !!selectedSubClass),
              // Map collective sub levels
              children: [
                ...collectiveSubLevels
                  .filter((collectiveSubLevel) => collectiveSubLevel.parent === filteredSubClass.id)
                  .map((filteredCollectiveSubLevel) => ({
                    ...getRowProps(filteredCollectiveSubLevel, 'collective-sub-level'),
                    // Map other classifications and districts
                    children: [
                      // Map other classification
                      ...otherClassifications
                        .filter(
                          (otherClassification) =>
                            otherClassification.parent === filteredCollectiveSubLevel.id,
                        )
                        .map((filteredOtherClassification) => ({
                          ...getRowProps(filteredOtherClassification, 'other-classification'),
                          // Map other classification sub level
                          children: otherClassificationSubLevels
                            .filter(
                              (otherClassificationSubLevel) =>
                                otherClassificationSubLevel.parent ===
                                filteredOtherClassification.id,
                            )
                            .map((filteredOtherClassificationSubLevel) => ({
                              ...getRowProps(
                                filteredOtherClassificationSubLevel,
                                'other-classification-sub-level',
                              ),
                            })),
                        })),
                      // Map districts
                      ...districts
                        .filter(
                          (district) => district.parentClass === filteredCollectiveSubLevel.id,
                        )
                        .map((filteredDistrict) => ({
                          ...getRowProps(filteredDistrict, 'collective-district-preview'),
                        })),
                    ],
                  })),
                // Map districts
                ...districts
                  .filter((district) => district.parentClass === filteredSubClass.id)
                  .map((filteredDistrict) => ({
                    ...getRowProps(filteredDistrict, 'district-preview'),
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
    const {
      selectedClass,
      selectedDistrict,
      selectedMasterClass,
      selectedSubClass,
      selectedCollectiveSubLevel,
      selectedOtherClassification,
      selectedOtherClassificationSubLevel,
    } = selections;
    const { districts } = batchedCoordinationLocations;

    const finalDistricts = [];

    if (selectedDistrict) {
      finalDistricts.push(selectedDistrict);
    } else if (!selectedSubClass?.name.toLocaleLowerCase().includes('suurpiiri')) {
      finalDistricts.push(...districts);
    }

    const list = {
      masterClasses: selectedMasterClass ? [selectedMasterClass] : masterClasses,
      classes: selectedClass ? [selectedClass] : classes,
      subClasses: selectedSubClass ? [selectedSubClass] : subClasses,
      collectiveSubLevels: selectedCollectiveSubLevel
        ? [selectedCollectiveSubLevel]
        : collectiveSubLevels,
      districts: finalDistricts,
      otherClassifications: selectedOtherClassification
        ? [selectedOtherClassification]
        : otherClassifications,
      otherClassificationSubLevels: selectedOtherClassificationSubLevel
        ? [selectedOtherClassificationSubLevel]
        : otherClassificationSubLevels,
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
