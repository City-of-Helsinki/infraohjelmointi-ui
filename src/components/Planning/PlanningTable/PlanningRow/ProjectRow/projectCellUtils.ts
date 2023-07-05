import {
  IProjectCell,
  IProjectRequest,
  IProjectFinancesRequestObject,
  ProjectCellGrowDirection,
  IProjectFinances,
} from '@/interfaces/projectInterfaces';
import {
  createDateToEndOfYear,
  createDateToStartOfYear,
  removeYear,
  getFirstDate,
  addYear,
  getLastDate,
  getYear,
  updateYear,
} from '@/utils/dates';

export const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`project-row-${projectId}`)?.classList.add('active');
};

export const getCellTypeUpdateRequestData = (
  cell: IProjectCell,
  phase: string,
): IProjectRequest => {
  const {
    type,
    startYear,
    projectEstDates: { estPlanningEnd, estConstructionStart },
    next,
    prev,
  } = cell;
  const req: IProjectRequest = { finances: { year: startYear } };
  /**
   * Returns the first/last valid construction/planning cell and sets any inbetween cell finances to null.
   * Traverses backwards to find a planning cell and forward to find a construction cell.
   * @param cellType the type of cell to find
   * @returns IProjectCell
   */
  const traverseAndSetGapCellFinancesNull = (cellType: 'construction' | 'planning') => {
    let head: IProjectCell | null = cellType === 'construction' ? next : prev;
    while (head && !head.type.toLowerCase().includes(cellType)) {
      // Have to use a if condition to check as other operators are still raising typescript errors
      if (req.finances) {
        (req.finances[head.financeKey as keyof IProjectFinancesRequestObject] as null) = null;
      }
      head = cellType === 'construction' ? head.next : head.prev;
    }
    return head;
  };
  /**
   * Traverses backwards from current cell to get the first valid planning cell
   * @returns IProjectCell
   */
  const getFirstPlanCellBehind = () => {
    return traverseAndSetGapCellFinancesNull('planning');
  };
  /**
   * Traverses forward from current cell to get the first valid construction cell
   * @returns IProjectCell
   */
  const getFirstConCellAhead = () => {
    return traverseAndSetGapCellFinancesNull('construction');
  };
  /**
   * Gets EndOfYear date from the first valid planning cell behind
   * @returns string
   */
  const getDateFromFirstPlanCellBehind = () => {
    const planCellBehind = getFirstPlanCellBehind();
    return planCellBehind ? createDateToEndOfYear(planCellBehind.year) : null;
  };
  /**
   * Gets StartOfYear date from the first valid construction cell ahead
   * @returns string
   */
  const getDateFromFirstConCellAhead = () => {
    const conCellAhead = getFirstConCellAhead();
    return conCellAhead ? createDateToStartOfYear(conCellAhead.year) : null;
  };
  /**
   * Sets estPlanningEnd and estConstructionStart dates appropriately
   * to convert current cell to construction
   * @param isOverlap is current cell type 'overlap'
   * @returns void
   */
  const updateCellToConstruction = (isOverlap: boolean) => {
    req.estPlanningEnd = cell.prev?.type.includes('planning')
      ? removeYear(estPlanningEnd)
      : getDateFromFirstPlanCellBehind();
    if (!isOverlap) {
      if (cell.next?.type.includes('construction')) {
        req.estConstructionStart = removeYear(estConstructionStart);
      } else {
        traverseAndSetGapCellFinancesNull('construction');
        req.estConstructionStart = getFirstDate(estPlanningEnd);
      }
    }
  };
  /**
   * Sets estPlanningEnd and estConstructionStart dates appropriately
   * to convert current cell to planning
   * @param isOverlap is current cell type 'overlap'
   * @returns void
   */
  const updateCellToPlanning = (isOverlap: boolean) => {
    if (!isOverlap) {
      if (cell.prev?.type.includes('planning')) {
        req.estPlanningEnd = addYear(estPlanningEnd);
      } else {
        traverseAndSetGapCellFinancesNull('planning');
        req.estPlanningEnd = getLastDate(estConstructionStart);
      }
    }
    req.estConstructionStart = cell.next?.type.includes('construction')
      ? addYear(estConstructionStart)
      : getDateFromFirstConCellAhead();
  };
  switch (type) {
    case 'planningEnd':
      updateCellToConstruction(false);
      break;
    case 'constructionStart':
      updateCellToPlanning(false);
      break;
    case 'overlap':
      if (phase.includes('construction')) {
        updateCellToConstruction(true);
      }
      if (phase.includes('planning')) {
        updateCellToPlanning(true);
      }
      break;
    default:
  }
  return req;
};

export const getRemoveRequestData = (cell: IProjectCell): IProjectRequest => {
  const {
    type,
    isEndOfTimeline,
    isStartOfTimeline,
    isLastOfType,
    timelineDates: { planningStart, planningEnd, constructionStart, constructionEnd },
    projectEstDates: { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd },
    cellToUpdate,
    financesToReset,
    financeKey,
    budget,
    affectsDates,
    startYear,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear, ...financesToReset } };

  const updatePlanningStart = () => {
    const updatedDate = updateYear(cellToUpdate?.year, planningStart);
    if (estPlanningStart) {
      req.estPlanningStart = updatedDate;
    }
    req.planningStartYear = getYear(updatedDate);
  };

  const updatePlanningEnd = () => {
    const updatedDate = updateYear(cellToUpdate?.year, planningEnd);
    if (isLastOfType) {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
      req.planningStartYear = getYear(updatedDate);
    } else if (estPlanningEnd) {
      req.estPlanningEnd = updatedDate;
    }
  };

  const updateConstructionStart = () => {
    const updatedDate = updateYear(cellToUpdate?.year, constructionStart);
    if (estConstructionStart) {
      req.estConstructionStart = updatedDate;
    }
    req.constructionEndYear = getYear(updatedDate);
  };

  const updateConstructionEnd = () => {
    const updatedDate = updateYear(cellToUpdate?.year, constructionEnd);
    if (!isLastOfType) {
      if (estConstructionEnd) {
        req.estConstructionEnd = updatedDate;
      }
      req.constructionEndYear = getYear(updatedDate);
    } else {
      req.constructionEndYear = getYear(planningStart);
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
    }
  };

  const updateOverlap = () => {
    if (isStartOfTimeline && isEndOfTimeline) {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
      req.planningStartYear = null;
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
      req.constructionEndYear = null;
    } else if (isStartOfTimeline) {
      if (estPlanningStart) {
        req.estPlanningStart = addYear(planningStart);
      }
      if (estPlanningEnd) {
        req.estPlanningEnd = addYear(planningEnd);
      }
      if (estConstructionStart) {
        req.estConstructionStart = addYear(constructionStart);
      }
      req.planningStartYear = getYear(planningEnd) + 1;
    } else if (isEndOfTimeline) {
      if (estConstructionStart) {
        req.estConstructionStart = removeYear(constructionStart);
      }
      if (estConstructionEnd) {
        req.estConstructionEnd = removeYear(constructionEnd);
      }
      if (estPlanningEnd) {
        req.estPlanningEnd = removeYear(planningEnd);
      }
      req.constructionEndYear = getYear(constructionEnd) - 1;
    }
  };

  const updateDatesIfStartEndOrOverlap = () => {
    switch (type) {
      case 'planningStart':
        updatePlanningStart();
        break;
      case 'planningEnd':
        updatePlanningEnd();
        break;
      case 'constructionStart':
        updateConstructionStart();
        break;
      case 'constructionEnd':
        updateConstructionEnd();
        break;
      case 'overlap':
        updateOverlap();
        break;
      default:
        return;
    }
  };

  const updateFinances = () => {
    if (!req.finances) {
      return;
    }

    if (cellToUpdate) {
      const updateKey = cellToUpdate.financeKey;
      const updateBudget = cellToUpdate.budget;
      (req.finances[updateKey as keyof IProjectFinancesRequestObject] as string | null) = (
        parseInt(budget ?? '0') + parseInt(updateBudget ?? '0')
      ).toString();
    }

    (req.finances[financeKey as keyof IProjectFinancesRequestObject] as string | null) =
      affectsDates ? '0' : null;
  };

  updateDatesIfStartEndOrOverlap();
  updateFinances();

  return req;
};

export const getAddRequestData = (direction: ProjectCellGrowDirection, cell: IProjectCell) => {
  const {
    timelineDates: { planningStart, planningEnd, constructionStart, constructionEnd },
    projectEstDates: { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd },
    next,
    prev,
    startYear,
    affectsDates,
    isStartOfTimeline,
    type,
    isLastOfType,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear } };

  const updateLeft = () => {
    if (isStartOfTimeline && (type.includes('planning') || type === 'overlap')) {
      if (estPlanningStart) {
        req.estPlanningStart = removeYear(planningStart);
      }
      req.planningStartYear = getYear(removeYear(planningStart));
    } else if (
      (isLastOfType && type === 'constructionEnd') ||
      (type === 'constructionStart' && estConstructionStart)
    ) {
      req.estConstructionStart = removeYear(constructionStart);
    }
  };

  const updateRight = () => {
    if (type === 'planningEnd' && estPlanningEnd) {
      req.estPlanningEnd = addYear(planningEnd);
    } else if (type === 'constructionEnd' || type === 'overlap') {
      if (estConstructionEnd) {
        req.estConstructionEnd = addYear(constructionEnd);
      }
      req.constructionEndYear = getYear(addYear(constructionEnd));
    }
  };

  const updateStartOrEndDateIfCellAffectsDates = () => {
    if (!affectsDates) {
      return;
    }
    switch (direction) {
      case 'left':
        updateLeft();
        break;
      case 'right':
        updateRight();
        break;
    }
  };

  const setNextFinanceToZeroIfNull = () => {
    const nextCell = direction === 'right' ? next : prev;

    if (!req.finances || nextCell?.budget !== null) {
      return;
    }

    (req.finances[nextCell.financeKey as keyof IProjectFinancesRequestObject] as string) = '0';
  };

  updateStartOrEndDateIfCellAffectsDates();
  setNextFinanceToZeroIfNull();

  return req;
};

export const moveTimelineForward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
  const {
    timelineDates: { planningStart, planningEnd, constructionStart, constructionEnd },
    projectEstDates: { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd },
  } = cell;
  const { year, ...finances } = projectFinances;

  // Move all finance property values to the next property
  const financesMovedForward = Object.keys(finances).reduce(
    (movedFinances: IProjectFinances, key, i, keys) => {
      const financeKey = key as keyof Omit<IProjectFinances, 'year'>;
      // Cannot copy from -1 indexed cell, so default is 0
      if (i === 0) {
        movedFinances[financeKey] = '0';
      } else {
        movedFinances[financeKey] = finances[keys[i - 1] as keyof Omit<IProjectFinances, 'year'>];
      }
      return movedFinances;
    },
    { year } as IProjectFinances,
  );

  const req: IProjectRequest = { finances: financesMovedForward };

  if (estPlanningStart) {
    req.estPlanningStart = addYear(planningStart);
  }
  if (estPlanningEnd) {
    req.estPlanningEnd = addYear(planningEnd);
  }

  if (estConstructionStart) {
    req.estConstructionStart = addYear(constructionStart);
  }
  if (estConstructionEnd) {
    req.estConstructionEnd = addYear(constructionEnd);
  }

  req.planningStartYear = getYear(addYear(planningStart));
  req.constructionEndYear = getYear(addYear(constructionEnd));

  return req;
};

export const moveTimelineBackward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
  const {
    timelineDates: { planningStart, planningEnd, constructionStart, constructionEnd },
    projectEstDates: { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd },
  } = cell;
  const { year, ...finances } = projectFinances;

  // Move all finance property values to the previous property
  const financesMovedBackward = Object.keys(finances).reduce(
    (movedFinances: IProjectFinances, key, i, keys) => {
      const financeKey = key as keyof Omit<IProjectFinances, 'year'>;
      // Cannot copy from +1 indexed cell, so default is 0
      if (i === keys.length - 1) {
        movedFinances[financeKey] = '0';
      } else {
        movedFinances[financeKey] = finances[keys[i + 1] as keyof Omit<IProjectFinances, 'year'>];
      }
      return movedFinances;
    },
    { year } as IProjectFinances,
  );

  const req: IProjectRequest = { finances: financesMovedBackward };

  if (estPlanningStart) {
    req.estPlanningStart = removeYear(planningStart);
  }
  if (estPlanningEnd) {
    req.estPlanningEnd = removeYear(planningEnd);
  }

  if (estConstructionStart) {
    req.estConstructionStart = removeYear(constructionStart);
  }
  if (estConstructionEnd) {
    req.estConstructionEnd = removeYear(constructionEnd);
  }

  req.planningStartYear = getYear(removeYear(planningStart));
  req.constructionEndYear = getYear(removeYear(constructionEnd));

  return req;
};

export const getMoveTimelineRequestData = (
  cell: IProjectCell,
  direction: string,
  finances: IProjectFinances,
) => {
  const { isEndOfTimeline, isStartOfTimeline } = cell;

  let req: IProjectRequest = {};

  switch (true) {
    case direction === 'right' && isEndOfTimeline:
      req = moveTimelineForward(cell, finances);
      break;
    case direction === 'left' && isStartOfTimeline:
      req = moveTimelineBackward(cell, finances);
      break;
  }

  return req;
};
