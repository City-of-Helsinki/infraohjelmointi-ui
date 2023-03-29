import { BudgetType, CellType, IProject, IProjectCell } from '@/interfaces/projectInterfaces';
import { isInYearRange, isSameYear } from '@/utils/dates';
import { useEffect, useState } from 'react';

/**
 * Gets the cell to update, this cell will be the next cell that isn't a 'none' type
 */
const getCellToUpdate = (
  cells: Array<IProjectCell>,
  cell: IProjectCell,
  currentCellIndex: number,
) => {
  const growRight = (cell.type === 'planEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;
  // Find the next available cell backwards
  if (growRight) {
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

interface IBudgetsToReset {
  [key: string]: string;
}

/**
 * Builds an object of budgets that are between the current cell and the cell
 * that gets updated if the current cell is removed.
 *
 * These budgets are used to reset the values between the current and the cell to be updated to '0'.
 */
const getBudgetsToReset = (
  cells: Array<IProjectCell>,
  cell: IProjectCell,
  currentCellIndex: number,
  updateCellIndex: number,
) => {
  const growRight = (cell.type === 'planEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;

  const budgetsToReset = cells.reduce((acc: IBudgetsToReset, curr, i) => {
    if (growRight) {
      if (i > updateCellIndex && i < currentCellIndex) {
        acc[curr.budgetKey] = '0';
      }
    } else {
      if (i > currentCellIndex && i < updateCellIndex) {
        acc[curr.budgetKey] = '0';
      }
    }
    return acc;
  }, {});

  return budgetsToReset;
};

/**
 * Returns true if the cell is either:
 * - a start-cell
 * - an end-cell
 * - the last of its type
 * - the start of the timeline
 * - the end of the timeline
 */
const getIsEdgeCell = (cell: IProjectCell): boolean =>
  cell.type.includes('Start') ||
  cell.type.includes('End') ||
  cell.isLastOfType ||
  cell.isStartOfTimeline ||
  cell.isEndOfTimeline;

const getProjectCells = (project: IProject) => {
  const budgetKeys: Array<BudgetType> = [
    'budgetProposalCurrentYearPlus0',
    'budgetProposalCurrentYearPlus1',
    'budgetProposalCurrentYearPlus2',
    'preliminaryCurrentYearPlus3',
    'preliminaryCurrentYearPlus4',
    'preliminaryCurrentYearPlus5',
    'preliminaryCurrentYearPlus6',
    'preliminaryCurrentYearPlus7',
    'preliminaryCurrentYearPlus8',
    'preliminaryCurrentYearPlus9',
    'preliminaryCurrentYearPlus10',
  ];

  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd, name, id } =
    project;

  const projectBudgets = Object.entries(project).filter(
    ([key, _]) => budgetKeys.indexOf(key as BudgetType) !== -1,
  );

  const cells: Array<IProjectCell> = projectBudgets.map((v) => {
    const year: number = new Date().getFullYear() + parseInt(v[0].split('Plus')[1]);
    const isCurrentYear = (date: string | null | undefined) => isSameYear(date, year);
    const isPlanning = isInYearRange(year, estPlanningStart, estPlanningEnd);
    const isConstruction = isInYearRange(year, estConstructionStart, estConstructionEnd);

    const isStartOfTimeline = estPlanningStart
      ? isCurrentYear(estPlanningStart)
      : isCurrentYear(estConstructionStart);
    const isEndOfTimeline = estConstructionEnd
      ? isCurrentYear(estConstructionEnd)
      : isCurrentYear(estPlanningEnd);
    const isLastOfType =
      (isCurrentYear(estPlanningStart) && isCurrentYear(estPlanningEnd)) ||
      (isCurrentYear(estConstructionStart) && isCurrentYear(estConstructionEnd));

    let type: CellType = 'none';

    if (isPlanning && isConstruction) {
      type = 'overlap';
    } else if (isPlanning) {
      if (isCurrentYear(estPlanningEnd)) type = 'planEnd';
      else if (isCurrentYear(estPlanningStart)) type = 'planStart';
      else if (v[1] !== null) type = 'plan';
    } else if (isConstruction) {
      if (isCurrentYear(estConstructionEnd)) type = 'conEnd';
      else if (isCurrentYear(estConstructionStart)) type = 'conStart';
      else if (v[1] !== null) type = 'con';
    }

    return {
      year,
      type,
      planStart: type !== 'none' ? estPlanningStart : null,
      planEnd: type !== 'none' ? estPlanningEnd : null,
      conStart: type !== 'none' ? estConstructionStart : null,
      conEnd: type !== 'none' ? estConstructionEnd : null,
      isLastOfType,
      budgetKey: v[0] as BudgetType,
      budget: v[1],
      isStartOfTimeline,
      isEndOfTimeline,
      prev: null,
      next: null,
      cellToUpdate: null,
      title: name,
      id,
      isEdgeCell: false,
      growDirections: [],
      budgetsToReset: {},
      allBudgets: projectBudgets,
    };
  });

  const projectCells = cells.map((cell, index) => {
    const prev = index === 0 ? null : cells[index - 1];
    const next = index === cells.length - 1 ? null : cells[index + 1];
    const cellToUpdate = cell.type !== 'none' ? getCellToUpdate(cells, cell, index) : null;

    // Add grow directions for css buttons to render
    if (cell.type !== 'none') {
      if (prev && prev.type === 'none') cell.growDirections.push('left');
      if (next && next.type === 'none') cell.growDirections.push('right');
    }

    const updateIndex = cells.findIndex((c) => c.budgetKey === cellToUpdate?.budgetKey);

    const isEdgeCell = getIsEdgeCell(cell);

    return {
      ...cell,
      budgetsToReset:
        isEdgeCell && cellToUpdate ? getBudgetsToReset(cells, cell, index, updateIndex) : {},
      prev,
      next,
      cellToUpdate,
      isEdgeCell,
    };
  });

  return projectCells;
};

/**
 * Get 11 project cells from a project, each cell will include all the needed properties to patch and delete the budgets and
 * dates associated with the cell year. This whole structure can be a bit confusing, please refer to the comments on IProjectCell
 * for guidelines on what each property is used for.
 *
 * @param project
 * @returns a list of IProjectCell
 */
const useProjectCells = (project: IProject) => {
  const [projectCells, setProjectCells] = useState<Array<IProjectCell>>([]);

  useEffect(() => {
    if (project) {
      setProjectCells(getProjectCells(project));
    }
  }, [project]);

  // console.log(projectCells);

  return projectCells;
};

export default useProjectCells;
