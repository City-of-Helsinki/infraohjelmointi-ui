import { ProjectCellGrowDirection } from '@/components/Planning/PlanningGroupsTable/PlanningGroupsTableRow';
import { CellType } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { isInYearRange, isSameYear } from '@/utils/dates';
import { useEffect, useState } from 'react';

export interface IProjectCell {
  year: number;
  type: CellType;
  start: string;
  end: string;
  index: number;
  prev: IProjectCell | null;
  next: IProjectCell | null;
  isStartOfTimeline: boolean;
  isLastOfType: boolean;
  isEndOfTimeline: boolean;
  budgetKey: string;
  budget: string;
  cellToUpdate: IProjectCell | null;
  keysToReset: Array<string>;
  growDirections: Array<ProjectCellGrowDirection>;
  title: string;
  id: string;
}

const getProjectCells = (project: IProject) => {
  const budgetKeys = [
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

  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd } = project;

  const cells = Object.entries(project)
    .filter(([key, _]) => budgetKeys.indexOf(key) !== -1)
    .map((v, i) => {
      const year: number = new Date().getFullYear() + parseInt(v[0].split('Plus')[1]);
      const isPlanning = isInYearRange(year, estPlanningStart, estPlanningEnd);
      const isConstruction = isInYearRange(year, estConstructionStart, estConstructionEnd);

      const sameYear = (date: string | null | undefined) => isSameYear(date, year);

      const getType = (): CellType => {
        if (isPlanning && isConstruction) {
          return 'overlap';
        } else if (sameYear(estPlanningStart)) {
          if (sameYear(estPlanningEnd)) {
            return 'estPlanningEnd';
          } else {
            return 'estPlanningStart';
          }
        } else if (sameYear(estPlanningEnd)) {
          return 'estPlanningEnd';
        } else if (sameYear(estConstructionStart)) {
          if (sameYear(estConstructionEnd)) {
            return 'estConstructionEnd';
          } else {
            return 'estConstructionStart';
          }
        } else if (sameYear(estConstructionEnd)) {
          return 'estConstructionEnd';
        } else if (isPlanning) {
          return 'planning';
        } else if (isConstruction) {
          return 'construction';
        }
        return 'none';
      };

      const getStartEndAndLastOfType = () => {
        if (isPlanning && isConstruction) {
          return {
            start: estConstructionStart as string,
            end: estPlanningEnd as string,
            isLastOfType: sameYear(estPlanningStart) && sameYear(estPlanningEnd),
          };
        } else if (isPlanning) {
          return {
            start: estPlanningStart as string,
            end: estPlanningEnd as string,
            isLastOfType: sameYear(estConstructionStart) && sameYear(estConstructionEnd),
          };
        } else if (isConstruction) {
          return {
            start: estConstructionStart as string,
            end: estConstructionEnd as string,
            isLastOfType: sameYear(estPlanningEnd) && sameYear(estConstructionStart),
          };
        }
      };

      const isStartOfTimeline = estPlanningStart
        ? sameYear(estPlanningStart)
        : sameYear(estConstructionStart);
      const isEndOfTimeline = estConstructionEnd
        ? sameYear(estConstructionEnd)
        : sameYear(estPlanningEnd);

      return {
        year,
        type: getType(),
        ...getStartEndAndLastOfType(),
        index: i,
        budgetKey: v[0],
        budget: v[1],
        isStartOfTimeline,
        isEndOfTimeline,
        prev: null,
        next: null,
        cellToUpdate: null,
        title: project.name,
        id: project.id,
      };
    });

  const cellsWithPrevAndNext = cells.map((c, index) => {
    const prev = c.index === 0 ? null : cells[c.index - 1];
    const next = c.index === cells.length - 1 ? null : cells[c.index + 1];
    let cellToUpdate: IProjectCell | null = null;
    let keysToReset: Array<string> = [];

    const growDirections = [];

    // Add grow directions for css buttons to render
    if (c.type !== 'none') {
      if (prev && (prev.type === 'none' || prev.budget === null)) growDirections.push('left');
      if (next && (next.type === 'none' || next.budget === null)) growDirections.push('right');
    }

    // Find the next available cell backwards if it's the end of the timeline or the planning ends in the middle
    // next to an empty cell
    if ((c.type === 'estPlanningEnd' && !c.isLastOfType) || c.isEndOfTimeline) {
      for (let i = index - 1; i > 0; i--) {
        const cell = cells[i] as IProjectCell;
        if (cell.budget !== null && cell.type !== 'none') {
          cellToUpdate = cell;
          break;
        }
      }
    }
    // Find the next available cell forwards
    else {
      for (let i = index + 1; i < cells.length; i++) {
        const cell = cells[i] as IProjectCell;
        if (cell.budget !== null && cell.type !== 'none') {
          cellToUpdate = cell;
          break;
        }
      }
    }

    if (cellToUpdate) {
      keysToReset = cells
        .slice(
          c.index,
          cells.findIndex((c) => c.budgetKey === cellToUpdate?.budgetKey),
        )
        .map(({ budgetKey }) => budgetKey);
    }

    return {
      ...c,
      prev: prev,
      next: next,
      cellToUpdate: cellToUpdate,
      keysToReset,
      growDirections,
    };
  });

  return cellsWithPrevAndNext;
};

const useProjectCells = (project: IProject) => {
  const [projectCells, setProjectCells] = useState<Array<IProjectCell>>([]);

  useEffect(() => {
    if (project) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setProjectCells(getProjectCells(project));
    }
  }, [project]);

  return projectCells;
};

export default useProjectCells;
