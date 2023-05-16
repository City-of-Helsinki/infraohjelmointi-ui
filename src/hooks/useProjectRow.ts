import { IProjectSums } from '@/interfaces/common';
import {
  CellType,
  IMonthlyData,
  IProject,
  IProjectCell,
  IProjectFinances,
  IProjectFinancesRequestObject,
  ProjectCellGrowDirection,
} from '@/interfaces/projectInterfaces';
import { calcPercentage, calculateProjectRowSums } from '@/utils/calculations';
import {
  getDayFromDate,
  getDaysInMonthForGivenYear,
  getMonthFromDate,
  getYear,
  isInYearRange,
  isSameYear,
} from '@/utils/dates';
import moment from 'moment';
import { useEffect, useState } from 'react';

const getProjectCells = (project: IProject) => {
  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd, name, id } =
    project;

  const { year, ...finances } = project.finances;

  /**
   * Gets the type of the cell for the current year
   */
  const getType = (cellYear: number, value: string | null): CellType => {
    const isPlanning = isInYearRange(cellYear, estPlanningStart, estPlanningEnd);
    const isConstruction = isInYearRange(cellYear, estConstructionStart, estConstructionEnd);
    const isCellYear = (date?: string | null) => isSameYear(date, cellYear);

    const setPlanningType = () => {
      if (isCellYear(estPlanningEnd)) {
        return 'planningEnd';
      }
      if (isCellYear(estPlanningStart)) {
        return 'planningStart';
      }
      return value !== null ? 'planning' : 'none';
    };

    const setConstructionType = () => {
      if (isCellYear(estConstructionEnd)) {
        return 'constructionEnd';
      }
      if (isCellYear(estConstructionStart)) {
        return 'constructionStart';
      }
      return value !== null ? 'construction' : 'none';
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

  const getMonthDataList = (project: IProject, year: number): Array<IMonthlyData> => {
    const getMonthPercentage = (year: number, month: number, type: CellType) => {
      const daysInMonth = getDaysInMonthForGivenYear(year, month);

      // Planning
      if (type === 'planning') {
        const startDatesMonth = getMonthFromDate(project.estPlanningStart);
        const startDatesDay = getDayFromDate(project.estPlanningStart);

        const endDatesMonth = getMonthFromDate(project.estPlanningEnd);
        const endDatesDay = getDayFromDate(project.estPlanningEnd);

        // If it starts a later year
        if (getYear(project.estPlanningStart) > year) {
          return { percent: '0%', isStart: false };
        }

        // If it ends a later year and already started a previous year
        if (getYear(project.estPlanningEnd) > year && getYear(project.estPlanningStart) < year) {
          return { percent: '100%', isStart: false };
        }

        // If it starts and ends the same year
        if (
          getYear(project.estPlanningStart) === year &&
          getYear(project.estPlanningEnd) === year
        ) {
          if (startDatesMonth === month) {
            return {
              percent: `${100 - calcPercentage(startDatesDay, daysInMonth)}%`,
              isStart: true,
            };
          } else if (endDatesMonth === month) {
            return { percent: `${calcPercentage(endDatesDay, daysInMonth)}%`, isStart: false };
          } else if (endDatesMonth > month && startDatesMonth < month) {
            return { percent: '100%', isStart: false };
          }
        }
        // If it starts this year
        else if (getYear(project.estPlanningStart) === year) {
          if (startDatesMonth < month) {
            return { percent: '100%', isStart: false };
          } else if (startDatesMonth === month) {
            return {
              percent: `${100 - calcPercentage(startDatesDay, daysInMonth)}%`,
              isStart: true,
            };
          }
        }
        // If it ends this year
        else if (getYear(project.estPlanningEnd) === year) {
          if (endDatesMonth > month) {
            return { percent: '100%', isStart: false };
          } else if (endDatesMonth === month) {
            return { percent: `${calcPercentage(endDatesDay, daysInMonth)}%`, isStart: false };
          }
        }
      }

      // Construction
      if (type === 'construction') {
        const startDatesMonth = getMonthFromDate(project.estConstructionStart);
        const startDatesDay = getDayFromDate(project.estConstructionStart);

        const endDatesMonth = getMonthFromDate(project.estConstructionEnd);
        const endDatesDay = getDayFromDate(project.estConstructionEnd);

        // If it starts a later year
        if (getYear(project.estConstructionStart) > year) {
          return { percent: '0%', isStart: false };
        }

        // If it ends a later year and already started a previous year
        if (
          getYear(project.estConstructionEnd) > year &&
          getYear(project.estConstructionStart) < year
        ) {
          return { percent: '100%', isStart: false };
        }

        // If it starts and ends the same year
        if (
          getYear(project.estConstructionStart) === year &&
          getYear(project.estConstructionEnd) === year
        ) {
          if (startDatesMonth === month) {
            return {
              percent: `${100 - calcPercentage(startDatesDay, daysInMonth)}%`,
              isStart: true,
            };
          } else if (endDatesMonth === month) {
            return { percent: `${calcPercentage(endDatesDay, daysInMonth)}%`, isStart: false };
          } else if (endDatesMonth > month && startDatesMonth < month) {
            return { percent: '100%', isStart: false };
          }
        }
        // If it starts this year
        else if (getYear(project.estConstructionStart) === year) {
          if (startDatesMonth < month) {
            return { percent: '100%', isStart: false };
          } else if (startDatesMonth === month) {
            return {
              percent: `${100 - calcPercentage(startDatesDay, daysInMonth)}%`,
              isStart: true,
            };
          }
        }
        // If it ends this year
        else if (getYear(project.estConstructionEnd) === year) {
          if (endDatesMonth > month) {
            return { percent: '100%', isStart: false };
          } else if (endDatesMonth === month) {
            return { percent: `${calcPercentage(endDatesDay, daysInMonth)}%`, isStart: false };
          }
        }
      }

      return { percent: '0%', isStart: false };
    };

    return moment.monthsShort().map((m, i) => ({
      month: m.substring(0, 3),
      planning: getMonthPercentage(year, i + 1, 'planning'),
      construction: getMonthPercentage(year, i + 1, 'construction'),
    }));
  };

  // Create cells
  const cells: Array<IProjectCell> = Object.entries(finances).map(([key, value], i) => {
    const cellYear = year + i;

    const type = getType(cellYear, value);

    const isStartOfTimeline = estPlanningStart
      ? isSameYear(estPlanningStart, cellYear)
      : isSameYear(estConstructionStart, cellYear);

    const isEndOfTimeline = estConstructionEnd
      ? isSameYear(estConstructionEnd, cellYear)
      : isSameYear(estPlanningEnd, cellYear);

    const isLastOfType =
      (isSameYear(estPlanningStart, cellYear) && isSameYear(estPlanningEnd, cellYear)) ||
      (isSameYear(estConstructionStart, cellYear) && isSameYear(estConstructionEnd, cellYear));

    const isEdgeCell =
      type.includes('Start') ||
      type.includes('End') ||
      isLastOfType ||
      isStartOfTimeline ||
      isEndOfTimeline;

    return {
      year: cellYear,
      startYear: year,
      type,
      planningStart: type !== 'none' ? estPlanningStart : null,
      planningEnd: type !== 'none' ? estPlanningEnd : null,
      constructionStart: type !== 'none' ? estConstructionStart : null,
      constructionEnd: type !== 'none' ? estConstructionEnd : null,
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
      isEdgeCell,
      monthlyDataList: getMonthDataList(project, cellYear),
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
      cell.isEdgeCell && updateIndex ? getFinancesToReset(cell, index, updateIndex) : null;

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
