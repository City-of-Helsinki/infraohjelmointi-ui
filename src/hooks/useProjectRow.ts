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

    return { percent, isStart: startDatesMonth === month };
  };

  return moment.monthsShort().map((m, i) => ({
    month: m.substring(0, 3),
    planning: getMonthData(year, i + 1, 'planning'),
    construction: getMonthData(year, i + 1, 'construction'),
  }));
};

/**
 * Gets and sets the timeline dates to be used with drawing the timeline. This can be a blend of estPlanningStart,
 * estPlanningEnd, estConstructionStart, estConstructionEnd, planningStartYear and constructionEndYear
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
    if (estPlanningStart && estPlanningEnd) {
      timelineDates.planningStart = estPlanningStart;
      timelineDates.planningEnd = estPlanningEnd;
    } else if (planningStartYear) {
      timelineDates.planningStart = planningStartYearAsDate;
      timelineDates.planningEnd = planningEndYearAsDate;
    }
  };

  const setConstructionDates = () => {
    if (estConstructionStart && estConstructionEnd) {
      timelineDates.constructionStart = estConstructionStart;
      timelineDates.constructionEnd = estConstructionEnd;
    } else if (constructionEndYear === planningStartYear) {
      timelineDates.constructionStart = planningStartYearAsDate;
      timelineDates.constructionEnd = planningEndYearAsDate;
    } else if (constructionEndYear) {
      const planningEnd = estPlanningStart ?? planningEndYearAsDate;
      timelineDates.constructionStart = createDateToStartOfYear(getYear(planningEnd) + 1);
      timelineDates.constructionEnd = createDateToEndOfYear(constructionEndYear);
    }
  };

  setPlanningDates();
  setConstructionDates();

  return timelineDates;
};

const getProjectCells = (project: IProject) => {
  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd, name, id } =
    project;

  const { year, ...finances } = project.finances;

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
  const getCellToUpdate = (cell: IProjectCell, currentCellIndex: number) => {
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

  const timelineDates = getTimelineDates(project);

  // Create cells
  const cells: Array<IProjectCell> = Object.entries(finances).map(([key, value], i) => {
    const cellYear = year + i;

    const type = getType(cellYear, value, timelineDates);

    const { planningStart, planningEnd, constructionStart, constructionEnd } = timelineDates;

    const isStartOfTimeline = planningStart
      ? isSameYear(planningStart, cellYear)
      : isSameYear(constructionStart, cellYear);

    const isEndOfTimeline = constructionEnd
      ? isSameYear(constructionEnd, cellYear)
      : isSameYear(planningEnd, cellYear);

    const isLastOfType =
      (isSameYear(planningStart, cellYear) && isSameYear(planningEnd, cellYear)) ||
      (isSameYear(constructionStart, cellYear) && isSameYear(constructionEnd, cellYear));

    const getAffectsDates = () => {
      if (
        (type === 'constructionStart' && estConstructionStart) ||
        (type === 'constructionEnd' && estConstructionEnd)
      ) {
        return true;
      }
      if (
        (type === 'planningStart' && estPlanningStart) ||
        (type === 'planningEnd' && estPlanningEnd)
      ) {
        return true;
      }
      if (type.includes('End') && (estPlanningEnd || estConstructionEnd)) {
        return true;
      }
      return isLastOfType || isStartOfTimeline || isEndOfTimeline;
    };

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
      affectsDates: getAffectsDates(),
      monthlyDataList: getMonthDataList(cellYear, timelineDates),
      projectEstPlanningStart: estPlanningStart ?? null,
      projectEstPlanningEnd: estPlanningEnd ?? null,
      projectEstConstructionStart: estConstructionStart ?? null,
      projectEstConstructionEnd: estConstructionEnd ?? null,
    };
  });

  // Add financesToReset, next, prev and cellToUpdate
  const projectCells = cells.map((cell, index) => {
    const prev = index === 0 ? null : cells[index - 1];
    const next = index === cells.length - 1 ? null : cells[index + 1];
    const cellToUpdate = cell.type !== 'none' ? getCellToUpdate(cell, index) : null;

    const updateIndex =
      cellToUpdate && cells.findIndex((c) => c.financeKey === cellToUpdate?.financeKey);

    const financesToReset =
      cell.affectsDates && updateIndex ? getFinancesToReset(cell, index, updateIndex) : null;

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
