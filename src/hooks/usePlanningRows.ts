import { selectBatchedClasses } from '@/reducers/classSlice';
import { useAppSelector } from './common';
import { selectedBatchedLocations } from '@/reducers/locationSlice';
import { useEffect, useState } from 'react';
import { IClass, IClassFinances } from '@/interfaces/classInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { useParams } from 'react-router';
import {
  IDeviation,
  IPlanningCell,
  IPlanningRow,
  IPlanningRowLists,
  IPlanningRowSelections,
  PlanningRowType,
} from '@/interfaces/common';
import { selectGroups } from '@/reducers/groupSlice';
import { IGroup } from '@/interfaces/groupInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { formatNumber } from '@/utils/common';

interface IPlanningRowsState {
  lists: IPlanningRowLists;
  selections: IPlanningRowSelections;
  year: number;
  rows: Array<IPlanningRow>;
}

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
  parseInt(name.match(/^\d+\./)?.[0]?.slice(0, -1) ?? '');

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
 * Calculates the budgets for each cell for the current row. The first cell will get additional properties.
 *
 * @returns
 * - key: the key for the cell (key of the finance object)
 * - plannedBudget: sum of all underlying project finances for that year (calculated in the backend)
 * - frameBudget: the amount of frameBudget given to the underlying projects during that year
 * - deviation: the deviation between the plannedBudget and the framedBudget and if the value is negative
 */
export const calculatePlanningCells = (finances: IClassFinances): Array<IPlanningCell> => {
  const { year, budgetOverrunAmount, projectBudgets, ...rest } = finances;
  return Object.entries(rest).map(([key, value]) => {
    const { frameBudget, plannedBudget } = value;

    const deviation = frameBudget - plannedBudget;

    return {
      key,
      plannedBudget: formatNumber(plannedBudget),
      frameBudget: formatNumber(frameBudget),
      deviation: {
        value: formatNumber(deviation),
        isNegative: deviation < 0,
      },
    };
  });
};

interface IPlanningSums {
  plannedBudgets: string;
  costEstimateBudget: string;
  deviation?: IDeviation;
}

/**
 * Calculates the budgets for the current row.
 *
 * @returns
 * - plannedBudgets: sum of all plannedBudgets (cells) for the current row
 * - costEstimateBudget: sum of all the frameBudgets and budgetOverrunAmount
 * - deviation: deviation between costEstimateBudget and plannedBudgets and if the value is negative
 */
export const calculatePlanningRowSums = (
  finances: IClassFinances,
  type: PlanningRowType,
): IPlanningSums => {
  const { year, budgetOverrunAmount, projectBudgets, ...rest } = finances;

  const sumOfPlannedBudgets = Object.values(rest).reduce((accumulator, currentValue) => {
    if (currentValue !== null && currentValue.plannedBudget) {
      return accumulator + currentValue.plannedBudget;
    }
    return accumulator;
  }, 0);

  const sumOfFrameBudgets = Object.values(rest).reduce((accumulator, currentValue) => {
    if (currentValue !== null && currentValue.frameBudget) {
      return accumulator + currentValue.frameBudget;
    }
    return accumulator;
  }, 0);

  const sumOfFramesAndOverrun = sumOfFrameBudgets + budgetOverrunAmount;
  const deviationBetweenCostEstimateAndBudget = sumOfFramesAndOverrun - sumOfPlannedBudgets;

  const plannedBudgets = formatNumber(sumOfPlannedBudgets);
  const costEstimateBudget = formatNumber(
    type === 'group' ? projectBudgets : sumOfFramesAndOverrun,
  );

  return {
    plannedBudgets,
    costEstimateBudget,
    ...(type !== 'group' && {
      deviation: {
        value: formatNumber(deviationBetweenCostEstimateAndBudget),
        isNegative: deviationBetweenCostEstimateAndBudget < 0,
      },
    }),
    ...(type === 'group' && {
      projectBudgets,
    }),
  };
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
const buildPlanningTableRows = (state: IPlanningRowsState, projects: Array<IProject>) => {
  const {
    selections: { selectedMasterClass, selectedClass, selectedSubClass, selectedDistrict },
    lists: { masterClasses, classes, subClasses, districts, divisions, groups },
  } = state;

  const getRowProps = (
    item: IClass | ILocation | IGroup,
    type: PlanningRowType,
    defaultExpanded?: boolean,
  ): IPlanningRow => {
    return {
      type: type,
      name: item.name,
      path: type !== 'group' ? (item as IClass | ILocation).path : '',
      id: item.id,
      key: item.id,
      link: getLink(item, type, state.selections),
      defaultExpanded: defaultExpanded || false,
      children: [],
      projectRows: getSortedProjects(item.id, type, projects),
      cells: calculatePlanningCells(item.finances),
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
        ...sortByNumber(divisionsForDistrict).map((filteredDivision) => ({
          ...getRowProps(filteredDivision, 'division', true),
          // Map projects & groups
          children: getSortedGroupRows(filteredDivision.id, 'division'),
        })),
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
      params: `${type}=${id}&programmed=true`,
      direct: direct,
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
 * @returns rows for the PlanningTable and the currently selected rows
 */
const usePlanningRows = () => {
  const { masterClassId, classId, subClassId, districtId } = useParams();
  const batchedClasses = useAppSelector(selectBatchedClasses);
  const batchedLocations = useAppSelector(selectedBatchedLocations);
  const groups = useAppSelector(selectGroups);

  const [planningRowsState, setPlanningRowsState] = useState<IPlanningRowsState>({
    lists: {
      masterClasses: [],
      classes: [],
      subClasses: [],
      districts: [],
      divisions: [],
      groups: [],
    },
    selections: {
      selectedMasterClass: null,
      selectedClass: null,
      selectedSubClass: null,
      selectedDistrict: null,
    },
    rows: [],
    year: new Date().getFullYear(),
  });

  const { lists, selections } = planningRowsState;

  useEffect(() => {
    const { type, id } = getTypeAndIdForLowestExpandedRow(planningRowsState.selections);

    if (type && id) {
      fetchProjectsByRelation(type as PlanningRowType, id).then((projects) => {
        setPlanningRowsState((current) => ({
          ...current,
          rows: buildPlanningTableRows(planningRowsState, projects),
        }));
      });
    } else {
      setPlanningRowsState((current) => ({
        ...current,
        rows: buildPlanningTableRows(planningRowsState, []),
      }));
    }
  }, [lists, selections]);

  // React to changes in classes and set the selectedMasterClass/selectedClass/selectedSubClass if it is present in the route
  useEffect(() => {
    const { masterClasses, classes, subClasses, year } = batchedClasses;
    const selectedMasterClass = getSelectedItemOrNull(masterClasses, masterClassId);
    const selectedClass = getSelectedItemOrNull(classes, classId);
    const selectedSubClass = getSelectedItemOrNull(subClasses, subClassId);

    setPlanningRowsState((current) => ({
      ...current,
      selections: {
        ...current.selections,
        selectedMasterClass,
        selectedClass,
        selectedSubClass,
      },
      lists: {
        ...current.lists,
        masterClasses: selectedMasterClass ? [selectedMasterClass] : masterClasses,
        classes: selectedClass ? [selectedClass] : classes,
        subClasses: selectedSubClass ? [selectedSubClass] : subClasses,
      },
      year,
    }));
  }, [masterClassId, classId, subClassId, batchedClasses]);

  // React to changes in locations and set the selectedDistrict if it is present in the route
  useEffect(() => {
    const { districts, divisions } = batchedLocations;
    const selectedDistrict = getSelectedItemOrNull(districts, districtId) as ILocation;

    setPlanningRowsState((current) => ({
      ...current,
      selections: {
        ...current.selections,
        selectedDistrict,
      },
      lists: {
        ...current.lists,
        districts: selectedDistrict ? [selectedDistrict] : districts,
        divisions,
      },
    }));
  }, [districtId, batchedLocations]);

  // React to changes in allGroups
  useEffect(() => {
    setPlanningRowsState((current) => ({
      ...current,
      lists: {
        ...current.lists,
        groups,
      },
    }));
  }, [groups]);

  return planningRowsState;
};

export default usePlanningRows;
