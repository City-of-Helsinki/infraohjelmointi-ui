import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import {
  selectBatchedPlanningLocations,
  selectPlanningSubDivisions,
} from '@/reducers/locationSlice';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
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
import { isEqual, cloneDeep } from 'lodash';
import {
  buildPlanningRow,
  fetchProjectsByRelation,
  getSelectedOrAll,
  getTypeAndIdForLowestExpandedRow,
  sortByName,
} from '@/utils/planningRowUtils';
import { IClass, IClassFinances } from '@/interfaces/classInterfaces';

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
 * Reorders the given subclasses so that entries whose normalized Finnish name
 * equals `"luonnonsuojelualueet"` are moved to the end, preserving the relative
 * order of all other subclasses.
 */
const sortSubClassesWithLuonnonsuojelualueetLast = (subClasses: Array<IClass>) => {
  const others: Array<IClass> = [];
  const luonnonsuojelualueet: Array<IClass> = [];

  subClasses.forEach((subClass) => {
    const normalizedName = subClass.name?.trim().toLocaleLowerCase('fi') ?? '';
    const isLuonnonsuojelualueet = normalizedName === 'luonnonsuojelualueet';

    if (isLuonnonsuojelualueet) {
      luonnonsuojelualueet.push(subClass);
    } else {
      others.push(subClass);
    }
  });

  return [...others, ...luonnonsuojelualueet];
};

/**
 * Merges subclass finances with district frame budget data.
 *
 * This function takes a subclass and its associated district location, then creates
 * a merged finances object where the frame budget values from the district are
 * applied to each year in the subclass finances while preserving all other
 * financial data from the subclass.
 *
 * @param subClass - The class object containing financial data to be merged
 * @param districtForSubClass - Optional district location object containing frame budget data
 * @returns A new IClassFinances object with merged financial data, or the original
 *          subclass finances if no district is provided
 */
function mergeSubClassFinancesWithDistrictFrameBudget(
  subClass: IClass,
  districtForSubClass?: ILocation,
): IClassFinances {
  // Return original subclass finances if no matching district is found
  if (!districtForSubClass || subClass.name !== districtForSubClass.name) {
    return subClass.finances;
  }

  const { budgetOverrunAmount, projectBudgets, year, ...rest } = subClass.finances;

  const mergedFinances: IClassFinances = cloneDeep(subClass.finances);

  for (const yearKey of Object.keys(rest) as Array<keyof typeof rest>) {
    mergedFinances[yearKey] = {
      ...subClass.finances[yearKey],
      frameBudget: districtForSubClass.finances[yearKey].frameBudget,
    };
  }

  return mergedFinances;
}

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
export const buildPlanningTableRows = (
  list: IPlanningRowList,
  projects: Array<IProject>,
  selections: IPlanningRowSelections,
  subDivisions?: Array<ILocation>,
) => {
  const { masterClasses, classes, subClasses, districts, divisions, otherClassifications, groups } =
    list;
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
    parentRowPath?: string,
  ) =>
    buildPlanningRow({
      item,
      type,
      projects,
      expanded: defaultExpanded,
      districtsForSubClass,
      subDivisions: subDivisions,
      parentRowPath: parentRowPath,
    });

  // Groups can get mapped under subClasses, districts and divisions and sorts them by name
  const getSortedGroupRows = (
    id: string,
    type: PlanningRowType,
    parentRowPath: string | undefined,
  ) => {
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
    else if (type === 'division' || type == 'district' || type == 'districtPreview') {
      filteredGroups.push(...groups.filter((group) => group.locationRelation === id));
    }

    return sortByName(filteredGroups).map((group) => ({
      ...getRow(group as IGroup, 'group', undefined, undefined, subDivisions, parentRowPath),
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
            ...getSortedGroupRows(filteredClass.id, 'class', filteredClass.path),
            ...subClasses
              .filter((subClass) => subClass.parent === filteredClass.id)
              .map((filteredSubClass) => {
                const districtForSubClass = districts.find(
                  (district) => district.parentClass === filteredSubClass.id,
                );
                return {
                  ...filteredSubClass,
                  /* districts' (suurpiiri) framebudget is not available on a subClass level,
                     so it is merged with the subClass finances here */
                  finances: mergeSubClassFinancesWithDistrictFrameBudget(
                    filteredSubClass,
                    districtForSubClass,
                  ),
                };
              })
              .map((filteredSubClass) => ({
                ...getRow(filteredSubClass, subClassType, !!selectedSubClass),
                // DISTRICTS & GROUPS
                children: [
                  // groups
                  ...getSortedGroupRows(filteredSubClass.id, subClassType, filteredSubClass.path),
                  // districts
                  ...districts
                    .filter((district) => district.parentClass === filteredSubClass.id)
                    .map((filteredDistrict) => ({
                      ...getRow(filteredDistrict, districtType),
                      children: [
                        ...getSortedGroupRows(
                          filteredDistrict.id,
                          districtType,
                          filteredSubClass.path,
                        ),
                        ...divisions
                          .filter((division) => division.parent === filteredDistrict.id)
                          .map((filteredDivision) => ({
                            ...getRow(filteredDivision, 'division'),
                            children: [
                              ...getSortedGroupRows(
                                filteredDivision.id,
                                'division',
                                filteredSubClass.path,
                              ),
                            ],
                          })),
                      ],
                    })),
                  ...otherClassifications
                    .filter(
                      (otherClassifications) => otherClassifications.parent === filteredSubClass.id,
                    )
                    .map((filteredOthers) => ({
                      ...getRow(filteredOthers, 'otherClassification'),
                    })),
                ],
              })),
          ],
        })),
    };
  });

  const subClassDistrictRows = subClasses.map((subClass) => {
    const divisionsForSubClass = /suurpiiri|östersundom/.test(subClass.name.toLocaleLowerCase())
      ? divisions.filter((division) => division.parentClass === subClass.id)
      : [];

    const districtForSubClass = /suurpiiri|östersundom/.test(subClass.name.toLocaleLowerCase())
      ? districts.find((district) => district.parentClass === subClass.id)
      : undefined;

    const finances = mergeSubClassFinancesWithDistrictFrameBudget(subClass, districtForSubClass);

    const districtsForSubClass = districts.filter(
      (d) => d.parentClass === subClass.id && !d.parent,
    );

    const subClassDistrictRows = {
      ...getRow({ ...subClass, finances }, subClassType, !!selectedSubClass, districtsForSubClass),
      // DIVISIONS & GROUPS
      children: [
        // groups
        ...getSortedGroupRows(subClass.id, subClassType, subClass.path),
        // divisions
        ...sortLocationsByName(divisionsForSubClass).map((filteredDivision) => {
          const groupsForDivision = getSortedGroupRows(
            filteredDivision.id,
            'division',
            subClass.path,
          );
          return {
            ...getRow(filteredDivision, 'division', groupsForDivision.length > 0),
            // GROUPS (for division)
            children: groupsForDivision,
          };
        }),
      ],
    };

    return subClassDistrictRows;
  });

  const parentClassForDistrict = (district: ILocation) => {
    return (
      subClasses.find((subClass) => district.parentClass === subClass.id) ||
      classes.find((_class) => district.parentClass === _class.id) ||
      masterClasses.find((masterClass) => district.parentClass === masterClass.id)
    );
  };

  // Map the selected districts divisions and the groups & projects that belong to those divisions
  const districtRows = districts.map((district) => {
    const divisionsForDistrict = divisions.filter((division) => division.parent === district.id);
    const parentClassPath = parentClassForDistrict(district)?.path;
    return {
      ...getRow(district, districtType, true),
      // DIVISIONS & GROUPS
      children: [
        // groups
        ...getSortedGroupRows(district.id, districtType, parentClassPath),
        // divisions
        ...sortLocationsByName(divisionsForDistrict).map((filteredDivision) => {
          const groupsForDivision = getSortedGroupRows(
            filteredDivision.id,
            'division',
            parentClassPath,
          );
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
  const location = useLocation();

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
        dispatch(setProjects({ mode, projects }));
      } catch (e) {
        console.log('Error fetching projects for planning selections: ', e);
      }
    };

    // Prevent fetching projects if selected class/district is different what is shown on the page
    const queryParams = new URLSearchParams(location.search);
    const openedViewId = queryParams.get(type as string);

    if (type && id && openedViewId === id) {
      getAndSetProjectsForSelections(type as PlanningRowType, id);
    }
  }, [selections, groups, mode, forcedToFrame, startYear, dispatch, location.search]);

  // Build planning table rows when locations, classes, groups, project, mode or selections change
  useEffect(() => {
    if (mode !== 'planning') {
      return;
    }

    const { masterClasses, classes, subClasses, otherClassifications } = batchedPlanningClasses;
    const {
      selectedClass,
      selectedDistrict,
      selectedMasterClass,
      selectedSubClass,
      selectedOtherClassification,
    } = selections;
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
      subClasses: sortSubClassesWithLuonnonsuojelualueetLast(
        getSelectedOrAll(selectedSubClass, subClasses),
      ),
      collectiveSubLevels: [],
      districts: finalDistricts,
      otherClassifications: getSelectedOrAll(selectedOtherClassification, otherClassifications),
      otherClassificationSubLevels: [],
      divisions,
      groups,
    };

    const nextRows = buildPlanningTableRows(list, projects, selections, subDivisions);
    // Re-build planning rows if the existing rows are not equal
    if (!isEqual(nextRows, rows)) {
      dispatch(setPlanningRows(nextRows));
    }
  }, [
    startYear,
    batchedPlanningClasses,
    batchedPlanningLocations,
    groups,
    projects,
    selections,
    mode,
    forcedToFrame,
    startYear,
    subDivisions,
    rows,
    dispatch,
  ]);
};

export default usePlanningRows;
