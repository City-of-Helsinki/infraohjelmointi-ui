import { selectBatchedClasses } from '@/reducers/classSlice';
import { useAppDispatch, useAppSelector } from './common';
import { selectedBatchedLocations } from '@/reducers/locationSlice';
import { useEffect } from 'react';
import { IClass } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { useParams } from 'react-router';
import {
  IPlanningRow,
  IPlanningRowList,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/common';
import { selectGroups } from '@/reducers/groupSlice';
import { IGroup } from '@/interfaces/groupInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { calculatePlanningCells, calculatePlanningRowSums } from '@/utils/calculations';
import {
  selectProjects,
  selectSelections,
  setPlanningRows,
  setProjects,
  setSelectedClass,
  setSelectedDistrict,
  setSelectedMasterClass,
  setSelectedSubClass,
  setStartYear,
} from '@/reducers/planningSlice';
import _ from 'lodash';

/**
 * Returns false whether a given row is already selected and present in the url.
 *
 * @param type the type of the row
 * @param selections current row selections for all the rows
 */
const shouldNavigate = (type: PlanningRowType, selections: IPlanningRowSelections) => {
  const { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict } = selections;
  switch (type) {
    case 'masterClass':
      return !selectedMasterClass;
    case 'class':
      return !selectedClass;
    case 'subClass':
      return !selectedSubClass;
    case 'district-preview':
      return !selectedDistrict;
    default:
      return false;
  }
};

/**
 * Builds a link for a row. If the current rows type is already selected,
 * i.e. the row is a masterClass and there already is a selectedMasterClass, it will return null.
 *
 * @param item class or location
 * @param type the type that the link is created for
 */
const getLink = (
  item: IClass | ILocation | IGroup,
  type: PlanningRowType,
  selections: IPlanningRowSelections,
): string | null => {
  const { selectedMasterClass, selectedClass, selectedSubClass } = selections;

  if (shouldNavigate(type, selections)) {
    return [selectedMasterClass?.id, selectedClass?.id, selectedSubClass?.id, item.id]
      .join('/')
      .replace(/(\/{2,})/gm, '/') // replace triple /// with one in case of one of values is undefined/null
      .replace(/(^\/)|(\/$)/gm, ''); // remove the last and first / in case of the last one of values is undefined/null
  } else {
    return null;
  }
};

/**
 * Parses a location name and returns the number value at the beginning of the name.
 */
const parseNumberFromName = (name: string) =>
  parseInt(/^\d+\./.exec(name)?.[0]?.slice(0, -1) ?? '');

/**
 * Takes a list of groups or projects and returns them sorted by their name
 */
const sortByName = (list: Array<IProject> | Array<IGroup>) =>
  list.sort((a, b) => a.name.localeCompare(b.name));

/**
 * Takes a list of locations and returns them sorted by their name
 */
const sortByNumber = (list: Array<ILocation>) =>
  list.sort((n1, n2) => parseNumberFromName(n1.name) - parseNumberFromName(n2.name));

/**
 * Filters and sorts projects for a class, location or group alphabetically for a given row type.
 */
const getSortedProjects = (id: string, type: PlanningRowType, projects: Array<IProject>) => {
  let projectList: Array<IProject> = [];
  switch (type) {
    case 'class':
    case 'subClass':
      projectList = projects
        .filter((p) => !p.projectGroup && !p.projectLocation)
        .filter((p) => p.projectClass === id);
      break;
    case 'group':
      projectList = projects.filter((p) => p.projectGroup).filter((p) => p.projectGroup === id);
      break;
    case 'district':
    case 'division':
      projectList = projects.filter((p) => !p.projectGroup).filter((p) => p.projectLocation === id);
      break;
  }
  return sortByName(projectList) as Array<IProject>;
};

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

  const getRowProps = (
    item: IClass | ILocation | IGroup,
    type: PlanningRowType,
    expanded?: boolean,
  ): IPlanningRow => {
    const projectRows = getSortedProjects(item.id, type, projects);
    const defaultExpanded = expanded || (type === 'division' && projectRows.length > 0);
    return {
      type: type,
      name: item.name,
      path: type !== 'group' ? (item as IClass | ILocation).path : '',
      id: item.id,
      key: item.id,
      link: getLink(item, type, selections),
      defaultExpanded,
      children: [],
      projectRows,
      cells: calculatePlanningCells(item.finances, type),
      ...calculatePlanningRowSums(item.finances, type),
    };
  };

  // Groups can get mapped under subClasses, districts and divisions and sorts them by name
  const getSortedGroupRows = (id: string, type: PlanningRowType) => {
    const filteredGroups = [];
    // Filter groups under subClass only if there are is no locationRelation
    if (type === 'subClass') {
      filteredGroups.push(
        ...groups.filter((group) => !group.locationRelation && group.classRelation === id),
      );
    }
    // Filter groups under division or district
    else if (type === 'division' || type == 'district') {
      filteredGroups.push(...groups.filter((group) => group.locationRelation === id));
    }
    return sortByName(filteredGroups).map((group) => ({
      ...getRowProps(group as IGroup, 'group'),
    }));
  };

  // Map the class rows going from masterClasses to districts
  const classRows: Array<IPlanningRow> = masterClasses.map((masterClass) => {
    return {
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
              // Map districts & groups (groups only if they do not belong to a district)
              children: [
                ...getSortedGroupRows(filteredSubClass.id, 'subClass'),
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

  // Map the selected districts divisions and the groups & projects that belong to those divisions
  const locationRows = districts.map((district) => {
    const divisionsForDistrict = divisions.filter((division) => division.parent === district.id);
    return {
      ...getRowProps(district, 'district', true),
      // Map divisions & groups (groups only if there are no divisions)
      children: [
        ...getSortedGroupRows(district.id, 'district'),
        ...sortByNumber(divisionsForDistrict).map((filteredDivision) => {
          const groupsForDivision = getSortedGroupRows(filteredDivision.id, 'division');
          return {
            ...getRowProps(filteredDivision, 'division', groupsForDivision.length > 0),
            // Map projects & groups
            children: groupsForDivision,
          };
        }),
      ],
    };
  });

  return selectedDistrict ? locationRows : classRows;
};

/**
 * Returns the selected class or location from a list of classes or locations if it's found,
 * otherwise it will return null if no selection is made or found.
 *
 * @param list class or location list to compare
 * @param id id of the item to compare
 */
const getSelectedItemOrNull = (list: Array<IClass | ILocation>, id: string | undefined) =>
  (id ? list.find((l) => l.id === id) : null) as IClass | ILocation | null;

/**
 * Fetches projects for a given location or class.
 *
 * It will add the direct=true parameter to the search query if we're fetching projects for classes or subClasses, which
 * will only return projects that are directly underneath that class or subClass (children ignored).
 *
 * @returns a promise list of projects.
 */
const fetchProjectsByRelation = async (
  type: PlanningRowType,
  id: string | undefined,
): Promise<Array<IProject>> => {
  const direct = type === 'class' || type === 'subClass';
  try {
    const allResults = await getProjectsWithParams({
      params: `${type}=${id}`,
      direct: direct,
      programmed: true,
    });
    return allResults.results;
  } catch (e) {
    console.log('Error fetching projects by relation: ', e);
  }
  return [];
};

/**
 * Checks if there is a selectedClass, selectedSubClass or selectedDistrict and returns
 * the type and id for that, prioritizing the lowest row.
 */
const getTypeAndIdForLowestExpandedRow = (selections: IPlanningRowSelections) => {
  const { selectedClass, selectedSubClass, selectedDistrict } = selections;
  if (selectedDistrict) {
    return { type: 'district', id: selectedDistrict.id };
  } else if (selectedSubClass) {
    return { type: 'subClass', id: selectedSubClass.id };
  } else if (selectedClass) {
    return { type: 'class', id: selectedClass.id };
  } else {
    return { type: null, id: null };
  }
};

/**
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
  const projects = useAppSelector(selectProjects);
  const selections = useAppSelector(selectSelections);
  const batchedClasses = useAppSelector(selectBatchedClasses);
  const batchedLocations = useAppSelector(selectedBatchedLocations);
  const { masterClassId, classId, subClassId, districtId } = useParams();

  // Listen to masterClasses, classes and subClasses or their ids in the url and sets
  // the selectedMasterClass, selectedClass and selectedSubClass if found
  useEffect(() => {
    const { masterClasses, classes, subClasses, year } = batchedClasses;
    const nextMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const nextClass = getSelectedItemOrNull(classes, classId);
    const nextSubClass = getSelectedItemOrNull(subClasses, subClassId);

    dispatch(setStartYear(year));
    dispatch(setSelectedMasterClass(nextMasterClass));
    dispatch(setSelectedClass(nextClass));
    dispatch(setSelectedSubClass(nextSubClass));
  }, [masterClassId, classId, subClassId, batchedClasses]);

  // Listen to districts or districtId in the url and sets the selectedDistrict if found
  useEffect(() => {
    const { districts } = batchedLocations;
    const nextDistrict = getSelectedItemOrNull(districts, districtId) as ILocation;
    dispatch(setSelectedDistrict(nextDistrict));
  }, [districtId, batchedLocations]);

  // Fetch projects when selections change
  useEffect(() => {
    const { type, id } = getTypeAndIdForLowestExpandedRow(selections);
    if (type && id) {
      fetchProjectsByRelation(type as PlanningRowType, id)
        .then((res) => {
          dispatch(setProjects(res));
        })
        .catch(Promise.reject);
    }
  }, [selections]);

  // Build planning table rows when locations/classes/groups/project or selections change
  useEffect(() => {
    const { masterClasses, classes, subClasses } = batchedClasses;
    const { selectedClass, selectedDistrict, selectedMasterClass, selectedSubClass } = selections;
    const { districts, divisions } = batchedLocations;

    const list = {
      masterClasses: selectedMasterClass ? [selectedMasterClass] : masterClasses,
      classes: selectedClass ? [selectedClass] : classes,
      subClasses: selectedSubClass ? [selectedSubClass] : subClasses,
      districts: selectedDistrict ? [selectedDistrict] : districts,
      divisions,
      groups,
    };

    dispatch(setPlanningRows(buildPlanningTableRows(list, projects, selections)));
  }, [batchedClasses, batchedLocations, groups, projects, selections]);
};

export default usePlanningRows;
