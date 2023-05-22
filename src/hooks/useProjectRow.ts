import { IProjectSums } from '@/interfaces/common';
import {
  CellType,
  IMonthlyData,
  IProject,
  IProjectCell,
  IProjectFinances,
  IProjectFinancesRequestObject,
  ITimelineDates,
  ProjectCellGrowDirection,
} from '@/interfaces/projectInterfaces';
import { calcPercentage, calculateProjectRowSums } from '@/utils/calculations';
import {
  createDateToEndOfYear,
  createDateToStartOfYear,
  getDayFromDate,
  getDaysInMonthForYear,
  getMonthFromDate,
  getYear,
  isInYearRange,
  isSameYear,
} from '@/utils/dates';
import moment from 'moment';
import { useEffect, useState } from 'react';

/**
 * Creates the timeline dates to be used with drawing the timeline and building the cells.
 *
 * The estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd dates are prioritized.
 * The planningStartYear and constructionEndYear properties are used if any of the above dates are missing
 * from the project.
 */
const getTimelineDates = (project: IProject) => {
  const {
    planningStartYear,
    constructionEndYear,
    estPlanningStart,
    estPlanningEnd,
    estConstructionStart,
    estConstructionEnd,
  } = project;

  const timelineDates: ITimelineDates = {
    planningStart: null,
    planningEnd: null,
    constructionStart: null,
    constructionEnd: null,
  };

  const planningStartYearAsDate = createDateToStartOfYear(planningStartYear);
  const planningEndYearAsDate = createDateToEndOfYear(planningStartYear);

  const setPlanningDates = () => {
    timelineDates.planningStart = estPlanningStart ?? planningStartYearAsDate;
    timelineDates.planningEnd = estPlanningEnd ?? planningEndYearAsDate;
  };

  const setConstructionDates = () => {
    const isConstructionEndSameAsPlanningStart = constructionEndYear === planningStartYear;
    const planningEnd = estPlanningEnd ?? planningEndYearAsDate;

    if (estConstructionStart) {
      timelineDates.constructionStart = estConstructionStart;
    } else if (constructionEndYear) {
      timelineDates.constructionStart = isConstructionEndSameAsPlanningStart
        ? planningStartYearAsDate
        : createDateToStartOfYear(getYear(planningEnd) + 1);
    } else if (planningStartYearAsDate) {
      timelineDates.constructionStart = planningStartYearAsDate;
    }

    if (estConstructionEnd) {
      timelineDates.constructionEnd = estConstructionEnd;
    } else if (constructionEndYear) {
      timelineDates.constructionEnd = isConstructionEndSameAsPlanningStart
        ? planningEndYearAsDate
        : createDateToEndOfYear(constructionEndYear);
    } else if (planningEndYearAsDate) {
      timelineDates.constructionEnd = planningEndYearAsDate;
    }
  };

  setPlanningDates();
  setConstructionDates();

  return timelineDates;
};

/**
 * Creates a list of monthly data to be used for drawing the monthly graphs when expanding a
 * year in the PlanningView.
 */
const getMonthDataList = (year: number, timelineDates: ITimelineDates): Array<IMonthlyData> => {
  const getMonthData = (year: number, month: number, type: CellType) => {
    const { planningStart, planningEnd, constructionStart, constructionEnd } = timelineDates;

    const daysInMonth = getDaysInMonthForYear(year, month);

    const start = type === 'planning' ? planningStart : constructionStart;
    const end = type === 'planning' ? planningEnd : constructionEnd;

    const startDatesMonth = getMonthFromDate(start);
    const startDatesDay = getDayFromDate(start);
    const endDatesMonth = getMonthFromDate(end);
    const endDatesDay = getDayFromDate(end);

    const isStartYear = getYear(start) === year;
    const isEndYear = getYear(end) === year;
    const isLaterYear = getYear(end) > year && getYear(start) < year;

    let percent = isLaterYear ? '100%' : '0%';

    const setPercentForStartAndEndYear = () => {
      if (startDatesMonth === month) {
        percent = `${100 - calcPercentage(startDatesDay, daysInMonth)}%`;
      } else if (endDatesMonth === month) {
        percent = `${calcPercentage(endDatesDay, daysInMonth)}%`;
      } else if (endDatesMonth > month && startDatesMonth < month) {
        percent = '100%';
      }
    };

    const setPercentForStartYear = () => {
      if (startDatesMonth < month) {
        percent = '100%';
      } else if (startDatesMonth === month) {
        percent = `${100 - calcPercentage(startDatesDay, daysInMonth)}%`;
      }
    };

    const setPercentForEndYear = () => {
      if (endDatesMonth > month) {
        percent = '100%';
      } else if (endDatesMonth === month) {
        percent = `${calcPercentage(endDatesDay, daysInMonth)}%`;
      }
    };

    switch (true) {
      case isStartYear && isEndYear:
        setPercentForStartAndEndYear();
        break;
      case isStartYear:
        setPercentForStartYear();
        break;
      case isEndYear:
        setPercentForEndYear();
        break;
    }

    return { percent, isStart: isStartYear && startDatesMonth === month };
  };

  return moment.monthsShort().map((m, i) => ({
    month: m.substring(0, 3),
    planning: getMonthData(year, i + 1, 'planning'),
    construction: getMonthData(year, i + 1, 'construction'),
  }));
};

/**
 * Gets the type of the cell for the current year. If the value of the cell is null the type
 * will always be 'none'.
 */
const getType = (
  cellYear: number,
  value: string | null,
  timelineDates: ITimelineDates,
): CellType => {
  const { planningStart, planningEnd, constructionStart, constructionEnd } = timelineDates;

  const isPlanning = isInYearRange(cellYear, planningStart, planningEnd);
  const isConstruction = isInYearRange(cellYear, constructionStart, constructionEnd);
  const isCellYear = (date?: string | null) => isSameYear(date, cellYear);

  const setPlanningType = () => {
    if (value === null) {
      return 'none';
    }
    if (isCellYear(planningEnd)) {
      return 'planningEnd';
    }
    if (isCellYear(planningStart)) {
      return 'planningStart';
    }
    return 'planning';
  };

  const setConstructionType = () => {
    if (value === null) {
      return 'none';
    }
    if (isCellYear(constructionEnd)) {
      return 'constructionEnd';
    }
    if (isCellYear(constructionStart)) {
      return 'constructionStart';
    }

    return 'construction';
  };

  switch (true) {
    case isPlanning && isConstruction:
      return 'overlap';
    case isPlanning:
      return setPlanningType();
    case isConstruction:
      return setConstructionType();
    default:
      return 'none';
  }
};

/**
 * Builds an object of budgets that are between the current cell and the cell
 * that gets updated if the current cell is removed.
 *
 * These budgets are used to reset the values between the current and the cell to be updated to '0'.
 */
const getFinancesToReset = (
  cell: IProjectCell,
  currentCellIndex: number,
  updateCellIndex: number,
  cells: Array<IProjectCell>,
  year: number,
): IProjectFinancesRequestObject | null => {
  const moveRight = (cell.type === 'planningEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;

  const financesToReset = cells.reduce(
    (acc: IProjectFinancesRequestObject, curr: IProjectCell, i) => {
      if (moveRight) {
        if (i > updateCellIndex && i < currentCellIndex) {
          (acc[curr.financeKey] as string) = '0';
        }
      } else {
        if (i > currentCellIndex && i < updateCellIndex) {
          (acc[curr.financeKey] as string) = '0';
        }
      }
      return acc;
    },
    { year: year },
  );

  // If there is only one key it will be year, return null instead
  return Object.keys(financesToReset).length > 1 ? financesToReset : null;
};

/**
 * Gets the cell to update, this cell will be the next cell that isn't a 'none' type
 */
const getCellToUpdate = (
  cell: IProjectCell,
  currentCellIndex: number,
  cells: Array<IProjectCell>,
) => {
  const moveRight = (cell.type === 'planningEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;

  // Find the next available cell backwards
  if (moveRight) {
    for (let i = currentCellIndex - 1; i > 0; i--) {
      if (cells[i].type !== 'none') return cells[i];
    }
  }
  // Find the next available cell forwards
  else {
    for (let i = currentCellIndex + 1; i < cells.length; i++) {
      if (cells[i].type !== 'none') return cells[i];
    }
  }
  return null;
};

/**
 * Gets the cell grow directions based on the next and prev cells
 */
const getCellGrowDirections = (
  cell: IProjectCell,
  prev: IProjectCell | null,
  next: IProjectCell | null,
) => {
  const growDirections: Array<ProjectCellGrowDirection> = [];

  if (cell.type === 'none') {
    return growDirections;
  }
  // If it's the first cell prev will not exist
  if (!prev && next?.type === 'none') {
    return ['right'] as Array<ProjectCellGrowDirection>;
  }
  // If it's the last cell next will not exist
  if (!next && prev?.type === 'none') {
    return ['left'] as Array<ProjectCellGrowDirection>;
  }
  // The cell can grow left if the previous cell is a 'none' type
  if (prev?.type === 'none') {
    growDirections.push('left');
  }
  // The cell can grow right if the next cell is a 'none' type
  if (next?.type === 'none') {
    growDirections.push('right');
  }

  return growDirections;
};

const getIsStartOfTimeline = (cellYear: number, timelineDates: ITimelineDates) => {
  const { planningStart, constructionStart } = timelineDates;
  return planningStart
    ? isSameYear(planningStart, cellYear)
    : isSameYear(constructionStart, cellYear);
};

const getIsEndOfTimeline = (cellYear: number, timelineDates: ITimelineDates) => {
  const { planningEnd, constructionEnd } = timelineDates;
  return constructionEnd
    ? isSameYear(constructionEnd, cellYear)
    : isSameYear(planningEnd, cellYear);
};

const getIsLastOfType = (cellYear: number, timelineDates: ITimelineDates) => {
  const { planningStart, planningEnd, constructionStart, constructionEnd } = timelineDates;
  return (
    (isSameYear(planningStart, cellYear) && isSameYear(planningEnd, cellYear)) ||
    (isSameYear(constructionStart, cellYear) && isSameYear(constructionEnd, cellYear))
  );
};

const getAffectsDates = (
  type: CellType,
  timelineDates: ITimelineDates,
  isStartOfTimeline: boolean,
  isEndOfTimeline: boolean,
  isLastOfType: boolean,
) => {
  const { planningStart, planningEnd, constructionStart, constructionEnd } = timelineDates;
  if ((type === 'planningStart' && planningStart) || (type === 'planningEnd' && planningEnd)) {
    return true;
  }
  if (
    (type === 'constructionStart' && constructionStart) ||
    (type === 'constructionEnd' && constructionEnd)
  ) {
    return true;
  }
  return isLastOfType || isStartOfTimeline || isEndOfTimeline;
};

const getProjectCells = (project: IProject) => {
  const { year, ...finances } = project.finances;
  const { name, id, estConstructionEnd, estConstructionStart, estPlanningEnd, estPlanningStart } =
    project;

  const timelineDates = getTimelineDates(project);

  // Create cells
  const cells: Array<IProjectCell> = Object.entries(finances).map(([key, value], i) => {
    const cellYear = year + i;

    const type = getType(cellYear, value, timelineDates);

    const isStartOfTimeline = getIsStartOfTimeline(cellYear, timelineDates);
    const isEndOfTimeline = getIsEndOfTimeline(cellYear, timelineDates);
    const isLastOfType = getIsLastOfType(cellYear, timelineDates);

    const monthlyDataList = getMonthDataList(cellYear, timelineDates);

    const affectsDates = getAffectsDates(
      type,
      timelineDates,
      isStartOfTimeline,
      isEndOfTimeline,
      isLastOfType,
    );

    return {
      year: cellYear,
      startYear: year,
      type,
      timelineDates: timelineDates,
      isLastOfType,
      financeKey: key as keyof IProjectFinances,
      budget: value,
      isStartOfTimeline,
      isEndOfTimeline,
      prev: null,
      next: null,
      cellToUpdate: null,
      title: name,
      id: id,
      growDirections: [],
      financesToReset: null,
      affectsDates,
      monthlyDataList,
      projectEstDates: {
        estConstructionEnd,
        estConstructionStart,
        estPlanningEnd,
        estPlanningStart,
      },
    };
  });

  // Add financesToReset, next, prev and cellToUpdate
  const projectCells = cells.map((cell, index) => {
    const prev = index === 0 ? null : cells[index - 1];
    const next = index === cells.length - 1 ? null : cells[index + 1];
    const cellToUpdate = cell.type !== 'none' ? getCellToUpdate(cell, index, cells) : null;

    const updateIndex =
      cellToUpdate && cells.findIndex((c) => c.financeKey === cellToUpdate?.financeKey);

    const financesToReset =
      cell.affectsDates && updateIndex
        ? getFinancesToReset(cell, index, updateIndex, cells, year)
        : null;

    return {
      ...cell,
      financesToReset,
      prev,
      next,
      cellToUpdate,
      growDirections: getCellGrowDirections(cell, prev, next),
    };
  });

  return projectCells;
};

interface IProjectRowsState {
  cells: Array<IProjectCell>;
  sums: IProjectSums;
  projectFinances: IProjectFinances | null;
}
/**
 * Get 11 project cells from a project, each cell will include all the needed properties to patch and delete the budgets and
 * dates associated with the cell year. This whole structure can be a bit confusing, please refer to the comments on IProjectCell
 * for guidelines on what each property is used for.
 *
 * @param project
 * @returns a list of IProjectCell
 */
const useProjectRow = (project: IProject) => {
  const [projectRowsState, setProjectRowsState] = useState<IProjectRowsState>({
    cells: [],
    sums: { availableFrameBudget: '0', costEstimateBudget: '0' },
    projectFinances: null,
  });

  useEffect(() => {
    if (project) {
      setProjectRowsState((current) => ({
        ...current,
        cells: getProjectCells(project),
        sums: calculateProjectRowSums(project),
        projectFinances: project.finances,
      }));
    }
  }, [project]);

  return projectRowsState;
};

export default useProjectRow;
