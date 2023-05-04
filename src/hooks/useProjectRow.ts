import { IProjectSums } from '@/interfaces/common';
import {
  CellType,
  IProject,
  IProjectCell,
  IProjectFinances,
  IProjectFinancesRequestObject,
  ProjectCellGrowDirection,
} from '@/interfaces/projectInterfaces';
import { calculateProjectRowSums } from '@/utils/calculations';
import { isInYearRange, isSameYear } from '@/utils/dates';
import { useEffect, useState } from 'react';

const getProjectCells = (project: IProject) => {
  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd, name, id } =
    project;

  const { year, ...finances } = project.finances;

  const financesList = Object.entries(finances).map(([key, value]) => [key, value]);

  /**
   * Gets the type of the cell for the current year
   */
  const getType = (cellYear: number, value: string | null): CellType => {
    const isPlanning = isInYearRange(cellYear, estPlanningStart, estPlanningEnd);
    const isConstruction = isInYearRange(cellYear, estConstructionStart, estConstructionEnd);
    const isCellYear = (date?: string | null) => isSameYear(date, cellYear);

    const setPlanningType = () => {
      if (isCellYear(estPlanningEnd)) {
        return 'planEnd';
      }
      if (isCellYear(estPlanningStart)) {
        return 'planStart';
      }
      return value !== null ? 'plan' : 'none';
    };

    const setConstructionType = () => {
      if (isCellYear(estConstructionEnd)) {
        return 'conEnd';
      }
      if (isCellYear(estConstructionStart)) {
        return 'conStart';
      }
      return value !== null ? 'con' : 'none';
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
    const moveRight = (cell.type === 'planEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;

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
    const moveRight = (cell.type === 'planEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;

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
      planStart: type !== 'none' ? estPlanningStart : null,
      planEnd: type !== 'none' ? estPlanningEnd : null,
      conStart: type !== 'none' ? estConstructionStart : null,
      conEnd: type !== 'none' ? estConstructionEnd : null,
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
      financesList,
      isEdgeCell,
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
  });

  useEffect(() => {
    if (project) {
      setProjectRowsState((current) => ({
        ...current,
        cells: getProjectCells(project),
        sums: calculateProjectRowSums(project),
      }));
    }
  }, [project]);

  return projectRowsState;
};

export default useProjectRow;
