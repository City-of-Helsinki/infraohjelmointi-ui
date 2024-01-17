import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectBatchedPlanningLocations, selectPlanningSubDivisions } from '@/reducers/locationSlice';
import { useEffect } from 'react';
import { ILocation } from '@/interfaces/locationInterfaces';
import {
  IPlanningRow,
  IPlanningRowList,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/planningInterfaces';
import { selectPlanningGroups } from '@/reducers/groupSlice';
import { IGroup } from '@/interfaces/groupInterfaces';
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
  subDivisions?: Array<ILocation>
) => {
  const { masterClasses, classes, subClasses, districts, divisions, otherClassifications, groups } = list;

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
    subDivisions?: Array<ILocation>,
  ) => buildPlanningRow({ item, type, projects, expanded: defaultExpanded, districtsForSubClass, subDivisions: subDivisions });

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
    else if (type === 'subClass' || type === 'class') {
      filteredGroups.push(
        ...groups.filter((group) => !group.locationRelation && group.classRelation === id),
      );
    }
    // Filter groups under division or district
    else if (type === 'division' || type == 'district') {
      filteredGroups.push(...groups.filter((group) => group.locationRelation === id));
    }

    return sortByName(filteredGroups).map((group) => ({
      ...getRow(group as IGroup, 'group', undefined, undefined, subDivisions),
    }));
  };

  // Map the class rows going from masterClasses to districts
  const classRows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
    return {
      // MASTER CLASSES
      ...getRow(masterClass, 'masterClass', !!selectedMasterClass),
      // CLASSES AND SUBCLASSES
      children: classes
        .filter((c) => c.parent === masterClass.id)
        .map((filteredClass) => ({
          ...getRow(filteredClass, 'class', !!selectedClass),
          children: [
            ...getSortedGroupRows(filteredClass.id, 'class'),
            ...subClasses.filter((subClass) => subClass.parent === filteredClass.id)
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
                ...otherClassifications
                .filter((otherClassifications) => otherClassifications.parent === filteredSubClass.id)
                .map((filteredOthers) => ({
                  ...getRow(filteredOthers, 'otherClassification'),
                }))
              ],
            })),
          ]
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
  const groups = useAppSelector(selectPlanningGroups);
  const rows = useAppSelector(selectPlanningRows);
  const projects = useAppSelector(selectProjects);
  const selections = useAppSelector(selectSelections);
  const forcedToFrame = useAppSelector(selectForcedToFrame);
  const startYear = useAppSelector(selectStartYear);
  const batchedPlanningClasses = useAppSelector(selectBatchedPlanningClasses);
  const batchedPlanningLocations = useAppSelector(selectBatchedPlanningLocations);
  const subDivisions = useAppSelector(selectPlanningSubDivisions);

  const mode = useAppSelector(selectPlanningMode);

  // Fetch projects when selections change
  useEffect(() => {
    // Don't fetch projects if mode isn't planning or the selections are the same as previously
    if (mode !== 'planning') {
      return;
    }

    const { type, id } = getTypeAndIdForLowestExpandedRow(selections);

    const getAndSetProjectsForSelections = async (type: PlanningRowType, id: string) => {
      try {
        const year = startYear ?? new Date().getFullYear();
        const projects = await fetchProjectsByRelation(type as PlanningRowType, id, false, year);
        dispatch(setProjects(projects));
      } catch (e) {
        console.log('Error fetching projects for planning selections: ', e);
      }
    };

    if (type && id) {
      getAndSetProjectsForSelections(type as PlanningRowType, id);
    }
  }, [selections, groups, mode, forcedToFrame]);

  // Build planning table rows when locations, classes, groups, project, mode or selections change
  useEffect(() => {
    if (mode !== 'planning') {
      return;
    }

    const { masterClasses, classes, subClasses, otherClassifications } = batchedPlanningClasses;
    const { selectedClass, selectedDistrict, selectedMasterClass, selectedSubClass, selectedOtherClassification} = selections;
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
      otherClassifications: getSelectedOrAll(selectedOtherClassification, otherClassifications),
      otherClassificationSubLevels: [],
      divisions,
      groups,
    };

    const nextRows = buildPlanningTableRows(list, projects, selections, subDivisions);

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
