import {
  IProjectCell,
  IProjectFinances,
  IProjectFinancesRequestObject,
  IProjectRequest,
  ProjectCellGrowDirection,
} from '@/interfaces/projectInterfaces';
import { patchProject } from '@/services/projectServices';
import { dispatchContextMenuEvent } from '@/utils/events';
import {
  ChangeEvent,
  FC,
  useCallback,
  useState,
  MouseEvent,
  useEffect,
  memo,
  useRef,
  useMemo,
} from 'react';
import {
  addYear,
  getYear,
  removeYear,
  updateYear,
  getLastDate,
  getFirstDate,
  createDateToEndOfYear,
  createDateToStartOfYear,
} from '@/utils/dates';
import EditTimelineButton from './EditTimelineButton';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import ProjectYearSummary from './ProjectYearSummary/ProjectYearSummary';
import _ from 'lodash';
import { useAppSelector } from '@/hooks/common';
import { selectSelectedYear } from '@/reducers/planningSlice';

const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`project-row-${projectId}`)?.classList.add('active');
};

const getCellTypeUpdateRequestData = (cell: IProjectCell, phase: string): IProjectRequest => {
  const { type, startYear } = cell;
  const req: IProjectRequest = { finances: { year: startYear } };
  /**
   * Returns the first/last valid construction/planning cell and sets any inbetween cell finances to null.
   * Traverses backwards to find a planning cell and forward to find a construction cell.
   * @param cellType the type of cell to find
   * @returns IProjectCell
   */
  const traverseAndSetGapCellFinancesNull = (cellType: 'Construction' | 'Planning') => {
    let head: IProjectCell | null = cellType === 'Construction' ? cell.next : cell.prev;
    while (
      head &&
      !head.type.includes(cellType) &&
      !head.projectEstDates[`est${cellType}End`] &&
      !head.projectEstDates[`est${cellType}Start`]
    ) {
      // Have to use a if condition to check as other operators are still raising typescript errors
      if (req.finances) {
        (req.finances[head.financeKey as keyof IProjectFinancesRequestObject] as null) = null;
      }
      head = cellType === 'Construction' ? head.next : head.prev;
    }
    return head;
  };
  /**
   * Traverses backwards from current cell to get the first valid planning cell
   * @returns IProjectCell
   */
  const getFirstPlanCellBehind = () => {
    return traverseAndSetGapCellFinancesNull('Planning');
  };
  /**
   * Traverses forward from current cell to get the first valid construction cell
   * @returns IProjectCell
   */
  const getFirstConCellAhead = () => {
    return traverseAndSetGapCellFinancesNull('Construction');
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
  switch (type) {
    case 'planningEnd':
      if (cell.prev?.type.includes('planning')) {
        req.estPlanningEnd = removeYear(cell.projectEstDates.estPlanningEnd);
      } else {
        req.estPlanningEnd = getDateFromFirstPlanCellBehind();
      }
      if (cell.next?.type.includes('construction')) {
        req.estConstructionStart = removeYear(cell.projectEstDates.estConstructionStart);
      } else {
        traverseAndSetGapCellFinancesNull('Construction');
        req.estConstructionStart = getFirstDate(cell.projectEstDates.estPlanningEnd);
      }
      break;
    case 'constructionStart':
      if (cell.prev?.type.includes('planning')) {
        req.estPlanningEnd = addYear(cell.projectEstDates.estPlanningEnd);
      } else {
        traverseAndSetGapCellFinancesNull('Planning');
        req.estPlanningEnd = getLastDate(cell.projectEstDates.estConstructionStart);
      }
      if (cell.next?.type.includes('construction')) {
        req.estConstructionStart = addYear(cell.projectEstDates.estConstructionStart);
      } else {
        req.estConstructionStart = getDateFromFirstConCellAhead();
      }
      break;
    case 'overlap':
      if (phase.includes('construction')) {
        if (cell.prev?.type.includes('planning')) {
          req.estPlanningEnd = removeYear(cell.projectEstDates.estPlanningEnd);
        } else {
          req.estPlanningEnd = getDateFromFirstPlanCellBehind();
        }
      }
      if (phase.includes('planning')) {
        if (cell.next?.type.includes('construction')) {
          req.estConstructionStart = addYear(cell.projectEstDates.estConstructionStart);
        } else {
          req.estConstructionStart = getDateFromFirstConCellAhead();
        }
      }
      break;
    default:
  }
  return req;
};

const getRemoveRequestData = (cell: IProjectCell): IProjectRequest => {
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
      console.log(updatedDate);
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

const getAddRequestData = (direction: ProjectCellGrowDirection, cell: IProjectCell) => {
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

const moveTimelineForward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
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

const moveTimelineBackward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
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

const getMoveTimelineRequestData = (
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

interface IProjectCellProps {
  cell: IProjectCell;
  projectFinances: IProjectFinances | null;
}

interface IProjectCellState {
  isReadOnly: boolean;
  formValue: number | null | string;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell, projectFinances }) => {
  const { budget, type, financeKey, year, growDirections, id, title, startYear } = cell;
  const cellRef = useRef<HTMLTableCellElement>(null);
  const selectedYear = useAppSelector(selectSelectedYear);

  const [projectCellState, setProjectCellState] = useState<IProjectCellState>({
    isReadOnly: true,
    formValue: parseInt(budget ?? '0'),
  });

  const { formValue, isReadOnly } = projectCellState;

  // Values of cells that have the none type will be empty strings to hide them
  const formDisplayValue = useMemo(
    () => (type !== 'none' ? formValue?.toString() : ''),
    [formValue, type],
  );
  const updateCell = useCallback(
    (req: IProjectRequest) => {
      // if there's only the year property in the finances object, delete it
      if (_.size(req.finances) === 1) {
        delete req.finances;
      }

      patchProject({
        id,
        data: req,
      }).catch(Promise.reject);
    },
    [id],
  );
  const canTypeUpdate = useCallback(() => {
    if (
      (cell.type === 'planningEnd' ||
        cell.type === 'constructionStart' ||
        cell.type === 'overlap') &&
      !cell.isLastOfType
    )
      return true;
    return false;
  }, [cell]);

  const onUpdateCellType = useCallback(
    (type: string) => {
      updateCell(getCellTypeUpdateRequestData(cell, type));
    },
    [cell, updateCell],
  );

  // Focusing the input field will activate the input field by switching its readOnly property
  const handleFocus = useCallback(() => {
    setProjectCellState((current) => ({ ...current, isReadOnly: !current.isReadOnly }));
  }, []);

  // Removes the zero value on change if there is only one zero in the value
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // If the value is more than one zero set the form value normally
    if (/^0{2,}/.exec(e.target.value)) {
      setProjectCellState((current) => ({ ...current, formValue: e.target.value }));
    }
    // If value is just a zero replace it
    else {
      setProjectCellState((current) => ({
        ...current,
        formValue: e.target.value ? +e.target.value : 0,
      }));
    }
  }, []);

  // Blurring the input field will patch the current budget
  const handleBlur = useCallback((): void => {
    setProjectCellState((current) => ({ ...current, isReadOnly: !current.isReadOnly }));
    if (formValue !== parseInt(budget ?? '0')) {
      updateCell({
        finances: {
          year: 2023,
          [financeKey]: formValue,
        },
      });
    }
  }, [formValue, budget, updateCell, financeKey]);

  const onRemoveCell = useCallback(() => {
    updateCell(getRemoveRequestData(cell));
  }, [updateCell, cell]);

  const onAddYear = useCallback(
    (direction: ProjectCellGrowDirection) => {
      updateCell(getAddRequestData(direction, cell));
    },
    [updateCell, cell],
  );

  const onMoveTimeline = useCallback(
    (direction: ProjectCellGrowDirection) => {
      const { isStartOfTimeline, isEndOfTimeline } = cell;
      if ((isStartOfTimeline || isEndOfTimeline) && projectFinances) {
        updateCell(getMoveTimelineRequestData(cell, direction, projectFinances));
      }
    },
    [cell, updateCell, projectFinances],
  );

  // Set the active css-class to the current row using the project id, this will render the edit-buttons and borders
  const onEditCell = useCallback(() => {
    addActiveClassToProjectRow(id);
  }, [id]);

  // Convert any cell type to 'planning' / 'construction' / 'overlap' / 'none'
  const cellTypeClass = useMemo(() => {
    if (type.includes('planning')) {
      return 'planning';
    } else if (type.includes('construction')) {
      return 'construction';
    } else {
      return type;
    }
  }, [type]);

  //
  const selectedYearClass = useMemo(
    () => (year === selectedYear ? 'selected-year' : ''),
    [selectedYear, year],
  );

  const currentYearClass = useMemo(
    () => (year === startYear ? 'current-year' : ''),
    [year, startYear],
  );

  // Open the custom context menu when right-clicking a cell
  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
        cellMenuProps: {
          year,
          title,
          cellType: cellTypeClass,
          onRemoveCell,
          onEditCell,
          onUpdateCellType,
          canTypeUpdate: canTypeUpdate(),
        },
      });
    },
    [onRemoveCell, onEditCell, cellTypeClass, year, title, onUpdateCellType, canTypeUpdate],
  );

  // Set the budgets value to a number if it exists
  useEffect(() => {
    setProjectCellState((current) => ({ ...current, formValue: parseInt(budget ?? '0') }));
  }, [budget]);

  // Sets isSelectedYear to true if the current cell is the selectedYear
  useEffect(() => {
    setProjectCellState((current) => ({ ...current, isSelectedYear: selectedYear === year }));
  }, [selectedYear, year]);

  return (
    <>
      <td
        ref={cellRef}
        className={`project-cell ${cellTypeClass} ${selectedYearClass} ${currentYearClass}`}
        onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
        data-testid={`project-cell-${year}-${id}`}
      >
        <div className="project-cell-input-wrapper">
          <div className="project-cell-input-container">
            <input
              value={formDisplayValue}
              type="number"
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              disabled={type === 'none'}
              readOnly={isReadOnly}
              className="project-cell-input"
              data-testid={`cell-input-${year}-${id}`}
              id={`cell-input-${year}-${id}`}
            />
          </div>
        </div>
        {type !== 'none' &&
          growDirections.map((d) => (
            <EditTimelineButton
              key={d}
              direction={d}
              id={`${year}-${id}`}
              onSingleClick={onAddYear}
              onDoubleClick={onMoveTimeline}
            />
          ))}
      </td>
      {selectedYearClass && <ProjectYearSummary cellType={cellTypeClass} {...cell} />}
    </>
  );
};

export default memo(ProjectCell);
