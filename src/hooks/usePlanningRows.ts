import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectBatchedPlanningLocations } from '@/reducers/locationSlice';
import { useEffect } from 'react';
import { ILocation } from '@/interfaces/locationInterfaces';
import {
  IPlanningRow,
  IPlanningRowList,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/planningInterfaces';
import { selectGroups } from '@/reducers/groupSlice';
import { IGroup } from '@/interfaces/groupInterfaces';
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
import _ from 'lodash';
import {
  buildPlanningRow,
  fetchProjectsByRelation,
  getSelectedOrAll,
  getTypeAndIdForLowestExpandedRow,
  sortByName,
} from '@/utils/planningRowUtils';
import { IClass } from '@/interfaces/classInterfaces';

/**
 * Parses a location name and returns the number value at the beginning of the name.
 */
const parseNumberFromLocationName = (name: string) =>
  parseInt(/^\d+\./.exec(name)?.[0]?.slice(0, -1) ?? '');

/**
 * Takes a list of locations and returns them sorted by their name
 */
const sortLocationsByName = (list: Array<ILocation>) =>
  [...list].sort(
    (a, b) => parseNumberFromLocationName(a.name) - parseNumberFromLocationName(b.name),
  );

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
const buildPlanningTableRows = (
  list: IPlanningRowList,
  projects: Array<IProject>,
  selections: IPlanningRowSelections,
) => {
  const { masterClasses, classes, subClasses, districts, divisions, groups } = list;

  const { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict } = selections;

  const districtType = selectedDistrict ? 'district' : 'districtPreview';

  const subClassType = /suurpiiri|östersundom/.test(
    selectedSubClass?.name.toLocaleLowerCase() ?? '',
  )
    ? 'subClassDistrict'
    : 'subClass';

  const getRow = (
    item: IClass | ILocation | IGroup,
    type: PlanningRowType,
    defaultExpanded?: boolean,
    districtsForSubClass?: IClass[],
  ) => buildPlanningRow({ item, type, projects, expanded: defaultExpanded, districtsForSubClass });

  // Groups can get mapped under subClasses, districts and divisions and sorts them by name
  const getSortedGroupRows = (id: string, type: PlanningRowType) => {
    const filteredGroups = [];
    // Filter all groups under subClassDistrict
    if (type === 'subClassDistrict') {
      const districtsForSubClass = districts.filter((d) => d.parentClass === id && !d.parent);

      const groupHasDistrictOrNoLocation = (g: IGroup) =>
        districtsForSubClass.some((d) => d.id === g.locationRelation) || !g.locationRelation;

      filteredGroups.push(
        ...groups.filter(
          (group) => group.classRelation === id && groupHasDistrictOrNoLocation(group),
        ),
      );
    }
    // Filter groups under subClass-preview only if there are is no locationRelation
    else if (type === 'subClass') {
      filteredGroups.push(
        ...groups.filter((group) => !group.locationRelation && group.classRelation === id),
      );
    }
    // Filter groups under division or district
    else if (type === 'division' || type == 'district') {
      console.log('was district');

      filteredGroups.push(...groups.filter((group) => group.locationRelation === id));

      console.log('filteredgroups: ', filteredGroups);
    }
    return sortByName(filteredGroups).map((group) => ({
      ...getRow(group as IGroup, 'group'),
    }));
  };

  // Map the class rows going from masterClasses to districts
  const classRows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
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
              ...getRow(filteredSubClass, subClassType, !!selectedSubClass),
              // DISTRICTS & GROUPS
              children: [
                // groups
                ...getSortedGroupRows(filteredSubClass.id, subClassType),
                // districts
                ...districts
                  .filter((district) => district.parentClass === filteredSubClass.id)
                  .map((filteredDistrict) => ({
                    ...getRow(filteredDistrict, districtType),
                  })),
              ],
            })),
        })),
    };
  });

  const subClassDistrictRows = subClasses.map((subClass) => {
    const divisionsForSubClass = /suurpiiri|östersundom/.test(subClass.name.toLocaleLowerCase())
      ? divisions.filter((division) => division.parentClass === subClass.id)
      : [];

    const districtsForSubClass = districts.filter(
      (d) => d.parentClass === subClass.id && !d.parent,
    );

    return {
      ...getRow(subClass, subClassType, !!selectedSubClass, districtsForSubClass),
      // DIVISIONS & GROUPS
      children: [
        // groups
        ...getSortedGroupRows(subClass.id, subClassType),
        // divisions
        ...sortLocationsByName(divisionsForSubClass).map((filteredDivision) => {
          const groupsForDivision = getSortedGroupRows(filteredDivision.id, 'division');
          return {
            ...getRow(filteredDivision, 'division', groupsForDivision.length > 0),
            // GROUPS (for division)
            children: groupsForDivision,
          };
        }),
      ],
    };
  });

  // Map the selected districts divisions and the groups & projects that belong to those divisions
  const districtRows = districts.map((district) => {
    const divisionsForDistrict = divisions.filter((division) => division.parent === district.id);
    return {
      ...getRow(district, districtType, true),
      // DIVISIONS & GROUPS
      children: [
        // groups
        ...getSortedGroupRows(district.id, districtType),
        // divisions
        ...sortLocationsByName(divisionsForDistrict).map((filteredDivision) => {
          const groupsForDivision = getSortedGroupRows(filteredDivision.id, 'division');
          return {
            ...getRow(filteredDivision, 'division', groupsForDivision.length > 0),
            // GROUPS (for division)
            children: groupsForDivision,
          };
        }),
      ],
    };
  });

  const getRows = () => {
    if (subClassType === 'subClassDistrict') {
      return subClassDistrictRows;
    } else if (selectedDistrict) {
      return districtRows;
    } else {
      return classRows;
    }
  };

  return getRows();
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
const usePlanningRows = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const rows = useAppSelector(selectPlanningRows);
  const projects = useAppSelector(selectProjects);
  const selections = useAppSelector(selectSelections);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const batchedPlanningClasses = useAppSelector(selectBatchedPlanningClasses);
  const batchedPlanningLocations = useAppSelector(selectBatchedPlanningLocations);

  const mode = useAppSelector(selectPlanningMode);

  // Fetch projects when selections change
  useEffect(() => {
    if (mode !== 'planning') {
      return;
    }

    const { type, id } = getTypeAndIdForLowestExpandedRow(selections);

    if (type && id) {
      fetchProjectsByRelation(type as PlanningRowType, id, false)
        .then((res) => {
          dispatch(setProjects(res));
        })
        .catch(Promise.reject);
    }
  }, [selections, groups, mode, forcedToFrame]);

  // Build planning table rows when locations, classes, groups, project, mode or selections change
  useEffect(() => {
    if (mode !== 'planning') {
      return;
    }

    const { masterClasses, classes, subClasses } = batchedPlanningClasses;
    const { selectedClass, selectedDistrict, selectedMasterClass, selectedSubClass } = selections;
    const { districts, divisions } = batchedPlanningLocations;

    const finalDistricts = [];

    if (selectedDistrict) {
      finalDistricts.push(selectedDistrict);
    }
    // Returning all districts since they are needed to filter correct groups for subClassDistrict level
    else {
      finalDistricts.push(...districts);
    }

    const list = {
      masterClasses: getSelectedOrAll(selectedMasterClass, masterClasses),
      classes: getSelectedOrAll(selectedClass, classes),
      subClasses: getSelectedOrAll(selectedSubClass, subClasses),
      collectiveSubLevels: [],
      districts: finalDistricts,
      otherClassifications: [],
      otherClassificationSubLevels: [],
      divisions,
      groups,
    };

    const nextRows = buildPlanningTableRows(list, projects, selections);

    // Re-build planning rows if the existing rows are not equal
    if (!_.isEqual(nextRows, rows)) {
      dispatch(setPlanningRows(nextRows));
    }
  }, [
    batchedPlanningClasses,
    batchedPlanningLocations,
    groups,
    projects,
    selections,
    mode,
    forcedToFrame,
  ]);
};

export default usePlanningRows;
