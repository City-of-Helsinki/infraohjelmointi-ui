import {
  IProjectCell,
  IProjectRequest,
  IProjectFinancesRequestObject,
  ProjectCellGrowDirection,
  IProjectFinances,
  IProjectEstDates,
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

/**
 * Mutates/updates the given request object if the project est dates has the given value
 */
const updateRequestIfValueExistsInProject = (
  key: string | null,
  updatedValue: string | null,
  projectEstDates: IProjectEstDates,
  req: IProjectRequest,
) => {
  const projectValue = projectEstDates[key as keyof typeof projectEstDates];

  if (projectValue && key) {
    Object.assign(req, { [key]: updatedValue });
  }
};

/**
 * Returns the first/last valid construction/planning cell and sets any inbetween cell finances to null.
 * Traverses backwards to find a planning cell and forward to find a construction cell.
 * @param cellType the type of cell to find
 *
 * @returns IProjectCell
 */
const traverseAndSetGapCellFinancesNull = (
  cellType: 'construction' | 'planning',
  req: IProjectRequest,
  next: IProjectCell | null,
  prev: IProjectCell | null,
) => {
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

  const nextCellIsConstruction = cell.next?.type.includes('construction');
  const prevCellIsPlanning = cell.prev?.type.includes('planning');

  const traverseAndSetGaps = (cellType: 'construction' | 'planning') =>
    traverseAndSetGapCellFinancesNull(cellType, req, next, prev);

  /**
   * Traverses backwards from current cell to get the first valid planning cell
   * @returns IProjectCell
   */
  const getFirstPlanCellBehind = () => traverseAndSetGaps('planning');

  /**
   * Traverses forward from current cell to get the first valid construction cell
   * @returns IProjectCell
   */
  const getFirstConCellAhead = () => traverseAndSetGaps('construction');

  /**
   * Gets EndOfYear date from the first valid planning cell behind
   * @returns string
   */
  const getDateFromFirstPlanCellBehind = () =>
    createDateToEndOfYear(getFirstPlanCellBehind()?.year);

  /**
   * Gets StartOfYear date from the first valid construction cell ahead
   * @returns string
   */
  const getDateFromFirstConCellAhead = () => createDateToStartOfYear(getFirstConCellAhead()?.year);

  const updatePlanningEnd = () =>
    (req.estPlanningEnd = prevCellIsPlanning
      ? removeYear(estPlanningEnd)
      : getDateFromFirstPlanCellBehind());

  const updatePlanningEndAndTraverseIfGaps = () => {
    updatePlanningEnd();

    if (nextCellIsConstruction) {
      req.estConstructionStart = removeYear(estConstructionStart);
      return;
    }

    traverseAndSetGaps('construction');
    req.estConstructionStart = getFirstDate(estPlanningEnd);
  };

  const updateConstructionStart = () =>
    (req.estConstructionStart = nextCellIsConstruction
      ? addYear(estConstructionStart)
      : getDateFromFirstConCellAhead());

  const updateConstructionStartAndTraverseIfGaps = () => {
    updateConstructionStart();

    if (prevCellIsPlanning) {
      req.estPlanningEnd = addYear(estPlanningEnd);
      return;
    }

    traverseAndSetGaps('planning');
    req.estPlanningEnd = getLastDate(estConstructionStart);
  };

  if (type === 'planningEnd') {
    updatePlanningEndAndTraverseIfGaps();
  } else if (type === 'constructionStart') {
    updateConstructionStartAndTraverseIfGaps();
  } else if (type === 'overlap' && phase.includes('construction')) {
    updatePlanningEnd();
  } else if (type === 'overlap' && phase.includes('planning')) {
    updateConstructionStart();
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
    projectEstDates,
    cellToUpdate,
    financesToReset,
    financeKey,
    budget,
    affectsDates,
    startYear,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear, ...financesToReset } };

  const updateIfValueExists = (key: string | null, updatedValue: string | null) => {
    updateRequestIfValueExistsInProject(key, updatedValue, projectEstDates, req);
  };

  const updatePlanningStart = () => {
    const updatedDate = updateYear(cellToUpdate?.year, planningStart);
    updateIfValueExists('estPlanningStart', updatedDate);
    req.planningStartYear = getYear(updatedDate);
  };

  const updatePlanningEnd = () => {
    const updatedDate = updateYear(cellToUpdate?.year, planningEnd);
    if (isLastOfType) {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
      req.planningStartYear = getYear(updatedDate);
    } else {
      updateIfValueExists('estPlanningEnd', updatedDate);
    }
  };

  const updateConstructionStart = () => {
    const updatedDate = updateYear(cellToUpdate?.year, constructionStart);
    updateIfValueExists('estConstructionStart', updatedDate);
    req.constructionEndYear = getYear(updatedDate);
  };

  const updateConstructionEnd = () => {
    const updatedDate = updateYear(cellToUpdate?.year, constructionEnd);
    if (!isLastOfType) {
      updateIfValueExists('estConstructionEnd', updatedDate);
      req.constructionEndYear = getYear(updatedDate);
    } else {
      req.constructionEndYear = getYear(planningStart);
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
    }
  };

  const updateOverlap = () => {
    const updateLastCell = () => {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
      req.planningStartYear = null;
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
      req.constructionEndYear = null;
    };

    const updateStartOfTimeline = () => {
      updateIfValueExists('estPlanningStart', addYear(planningStart));
      updateIfValueExists('estPlanningEnd', addYear(planningEnd));
      updateIfValueExists('estConstructionStart', addYear(constructionStart));
      req.planningStartYear = getYear(planningEnd) + 1;
    };

    const updateEndOfTimeline = () => {
      updateIfValueExists('estConstructionStart', removeYear(constructionStart));
      updateIfValueExists('estConstructionEnd', removeYear(constructionEnd));
      updateIfValueExists('estPlanningEnd', removeYear(planningEnd));
      req.constructionEndYear = getYear(constructionEnd) - 1;
    };

    if (isStartOfTimeline && isEndOfTimeline) {
      updateLastCell();
    } else if (isStartOfTimeline) {
      updateStartOfTimeline();
    } else if (isEndOfTimeline) {
      updateEndOfTimeline();
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
    projectEstDates,
    next,
    prev,
    startYear,
    affectsDates,
    isStartOfTimeline,
    type,
    isLastOfType,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear } };

  const updateIfValueExists = (key: string | null, updatedValue: string | null) => {
    updateRequestIfValueExistsInProject(key, updatedValue, projectEstDates, req);
  };

  const updateLeft = () => {
    if (isStartOfTimeline && (type.includes('planning') || type === 'overlap')) {
      updateIfValueExists('estPlanningStart', removeYear(planningStart));
      req.planningStartYear = getYear(removeYear(planningStart));
    } else if ((isLastOfType && type === 'constructionEnd') || type === 'constructionStart') {
      updateIfValueExists('estConstructionStart', removeYear(constructionStart));
    }
  };

  const updateRight = () => {
    if (type === 'planningEnd') {
      updateIfValueExists('estPlanningEnd', addYear(planningEnd));
    } else if (type === 'constructionEnd' || type === 'overlap') {
      updateIfValueExists('estConstructionEnd', addYear(constructionEnd));
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
    projectEstDates,
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

  const updateIfValueExists = (key: string | null, updatedValue: string | null) => {
    updateRequestIfValueExistsInProject(key, updatedValue, projectEstDates, req);
  };

  updateIfValueExists('estPlanningStart', addYear(planningStart));
  updateIfValueExists('estPlanningEnd', addYear(planningEnd));
  updateIfValueExists('estConstructionStart', addYear(constructionStart));
  updateIfValueExists('estConstructionEnd', addYear(constructionEnd));

  req.planningStartYear = getYear(addYear(planningStart));
  req.constructionEndYear = getYear(addYear(constructionEnd));

  return req;
};

export const moveTimelineBackward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
  const {
    timelineDates: { planningStart, planningEnd, constructionStart, constructionEnd },
    projectEstDates,
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

  const updateIfValueExists = (key: string | null, updatedValue: string | null) => {
    updateRequestIfValueExistsInProject(key, updatedValue, projectEstDates, req);
  };

  updateIfValueExists('estPlanningStart', removeYear(planningStart));
  updateIfValueExists('estPlanningEnd', removeYear(planningEnd));
  updateIfValueExists('estConstructionStart', removeYear(constructionStart));
  updateIfValueExists('estConstructionEnd', removeYear(constructionEnd));

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
