import { CellType } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { isInYearRange, isSameYear } from '@/utils/dates';
import { useEffect, useState } from 'react';

type BudgetType =
  | 'budgetProposalCurrentYearPlus0'
  | 'budgetProposalCurrentYearPlus1'
  | 'budgetProposalCurrentYearPlus2'
  | 'preliminaryCurrentYearPlus3'
  | 'preliminaryCurrentYearPlus4'
  | 'preliminaryCurrentYearPlus5'
  | 'preliminaryCurrentYearPlus6'
  | 'preliminaryCurrentYearPlus7'
  | 'preliminaryCurrentYearPlus8'
  | 'preliminaryCurrentYearPlus9'
  | 'preliminaryCurrentYearPlus10';

export type ProjectCellGrowDirection = 'left' | 'right';

export interface IProjectCell {
  year: number; // Year for the cell in question
  type: CellType; // Type of the cell (planning / construction / overlap / none)
  startForType: string | null | undefined; // Start of that types timeline (i.e. planning it would be estPlanningStart)
  endForType: string | null | undefined; // End of that types timeline (i.e. planning it would be estPlanningEnd)
  estPlanningStart: string | null | undefined;
  estPlanningEnd: string | null | undefined;
  estConstructionStart: string | null | undefined;
  estConstructionEnd: string | null | undefined;
  prev: IProjectCell | null; // Previous cell (to the left)
  next: IProjectCell | null; // Next cell (to the right)
  isStartOfTimeline: boolean; // Is the cell the start of the timeline
  isEndOfTimeline: boolean; // Is the cell the end of the timeline
  isLastOfType: boolean; // Is the cell the last of its type (i.e. last planning cell)
  budgetKey: BudgetType; // Object key for the budget that the cell represents
  budget: string; // Budget (keur value) of the cell
  cellToUpdate: IProjectCell | null; // Cell that should be updated if this cell is removed
  keysToReset: Array<BudgetType>; // List of keys representing budgets that should be reset if this cell is removed
  growDirections: Array<ProjectCellGrowDirection>; // 'left' and 'right', buttons for adding new cells are rendered based on these
  title: string; // Title of the project (used in the custom context menu when right-clicking a cell)
  id: string; // Id of the project
  isEdgeCell: boolean;
  allBudgets: Array<Array<string>>;
}

const getCellToUpdate = (cells: Array<IProjectCell>, cell: IProjectCell, index: number) => {
  const shrinkLeft = (cell.type === 'estPlanningEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;
  // Find the next available cell backwards if it's the end of the timeline or the planning ends in the middle
  // next to an empty cell
  if (shrinkLeft) {
    for (let i = index - 1; i > 0; i--) {
      const cell = cells[i] as IProjectCell;
      if (cell.budget !== null && cell.type !== 'none') {
        return cell;
      }
    }
  }
  // Find the next available cell forwards
  else {
    for (let i = index + 1; i < cells.length; i++) {
      const cell = cells[i] as IProjectCell;
      if (cell.budget !== null && cell.type !== 'none') {
        return cell;
      }
    }
  }
};

const getKeysToReset = (
  cells: Array<IProjectCell>,
  cell: IProjectCell,
  cellToUpdate: IProjectCell | null,
  isEdgeCell: boolean,
  index: number,
) => {
  const shrinkLeft = (cell.type === 'estPlanningEnd' && !cell.isLastOfType) || cell.isEndOfTimeline;

  const keysToReset: Array<BudgetType> = [];

  if (cellToUpdate && isEdgeCell) {
    const indexOfCellToUpdate = cells.findIndex((c) => c.budgetKey === cellToUpdate?.budgetKey);
    if (shrinkLeft) {
      for (let i = 0; i < cells.length; i++) {
        if (i > indexOfCellToUpdate && i < index) {
          keysToReset.push(cells[i].budgetKey);
        }
      }
    } else {
      for (let i = 0; i < cells.length; i++) {
        if (i > index && i < indexOfCellToUpdate) {
          keysToReset.push(cells[i].budgetKey);
        }
      }
    }
  }

  return keysToReset;
};

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
      if (isCurrentYear(estPlanningEnd)) type = 'estPlanningEnd';
      else if (isCurrentYear(estPlanningStart)) type = 'estPlanningStart';
      else if (v[1] !== null) type = 'planning';
    } else if (isConstruction) {
      if (isCurrentYear(estConstructionEnd)) type = 'estConstructionEnd';
      else if (isCurrentYear(estConstructionStart)) type = 'estConstructionStart';
      else if (v[1] !== null) type = 'construction';
    }

    return {
      year,
      type,
      startForType: isConstruction ? estConstructionStart : estPlanningStart,
      endForType: isPlanning ? estPlanningEnd : estConstructionEnd,
      estPlanningStart,
      estPlanningEnd,
      estConstructionStart,
      estConstructionEnd,
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
      keysToReset: [],
      allBudgets: projectBudgets,
    };
  });

  const cellsWithPrevAndNext = cells.map((c, i) => {
    const prev = i === 0 ? null : cells[i - 1];
    const next = i === cells.length - 1 ? null : cells[i + 1];
    const cellToUpdate =
      getCellToUpdate(cells as Array<IProjectCell>, c as IProjectCell, i) || null;

    // Add grow directions for css buttons to render
    if (c.type !== 'none') {
      if (prev && prev.type === 'none') c.growDirections.push('left');
      if (next && next.type === 'none') c.growDirections.push('right');
    }

    const isEdgeCell =
      c.type.includes('Start') ||
      c.type.includes('End') ||
      c.isLastOfType ||
      c.isStartOfTimeline ||
      c.isEndOfTimeline;

    return {
      ...c,
      keysToReset: getKeysToReset(cells as Array<IProjectCell>, c, cellToUpdate, isEdgeCell, i),
      prev,
      next,
      cellToUpdate,
      isEdgeCell,
    };
  });

  return cellsWithPrevAndNext;
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

  if (projectCells.length > 0) {
    console.log(projectCells);
  }

  return projectCells;
};

export default useProjectCells;
