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
import { addYear, getYear, removeYear, updateYear } from '@/utils/dates';
import EditTimelineButton from './EditTimelineButton';
import { ContextMenuType } from '@/interfaces/eventInterfaces';
import ProjectYearSummary from './ProjectYearSummary/ProjectYearSummary';

const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`project-row-${projectId}`)?.classList.add('active');
};

const getRemoveRequestData = (cell: IProjectCell): IProjectRequest => {
  const {
    type,
    isEndOfTimeline,
    isStartOfTimeline,
    isLastOfType,
    planningStart,
    planningEnd,
    constructionStart,
    constructionEnd,
    cellToUpdate,
    financesToReset,
    financeKey,
    budget,
    isEdgeCell,
    startYear,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear, ...financesToReset } };

  const updatePlanningEnd = () => {
    if (!isLastOfType) {
      req.estPlanningEnd = updateYear(cellToUpdate?.year, planningEnd);
    } else {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
    }
  };

  const updateConstructionEnd = () => {
    if (!isLastOfType) {
      req.estConstructionEnd = updateYear(cellToUpdate?.year, constructionEnd);
    } else {
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
    }
  };

  const updateOverlap = () => {
    if (isStartOfTimeline) {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
    } else {
      req.estPlanningEnd = removeYear(planningEnd);
    }
    if (isEndOfTimeline) {
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
    } else {
      req.estConstructionStart = addYear(constructionStart);
    }
  };

  const updateDatesIfStartEndOrOverlap = () => {
    switch (type) {
      case 'planningStart':
        req.estPlanningStart = updateYear(cellToUpdate?.year, planningStart);
        break;
      case 'planningEnd':
        updatePlanningEnd();
        break;
      case 'constructionStart':
        req.estConstructionStart = updateYear(cellToUpdate?.year, constructionStart);
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

    // If there is a cellToUpdate move the deleted cells budget to that cell
    if (cellToUpdate) {
      const updateKey = cellToUpdate.financeKey;
      const updateBudget = cellToUpdate.budget;
      (req.finances[updateKey as keyof IProjectFinancesRequestObject] as string) = (
        parseInt(budget ?? '0') + parseInt(updateBudget ?? '0')
      ).toString();
    }

    // Set the current cells value to '0' if it's an edge cell, otherwise set it to null to temporarily hide it
    (req.finances[financeKey as keyof IProjectFinancesRequestObject] as string | null) = isEdgeCell
      ? '0'
      : null;
  };

  updateDatesIfStartEndOrOverlap();
  updateFinances();

  return req;
};

const getAddRequestData = (direction: ProjectCellGrowDirection, cell: IProjectCell) => {
  const {
    type,
    planningStart,
    planningEnd,
    constructionStart,
    constructionEnd,
    next,
    prev,
    isLastOfType,
    startYear,
    isEdgeCell,
    isStartOfTimeline,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear } };

  const updateLeft = () => {
    if (
      isStartOfTimeline &&
      (type === 'planningStart' || type === 'planningEnd' || type === 'overlap')
    ) {
      req.estPlanningStart = removeYear(planningStart);
    } else if ((isLastOfType && type === 'constructionEnd') || type === 'constructionStart') {
      req.estConstructionStart = removeYear(constructionStart);
    }
  };

  const updateRight = () => {
    if (type === 'planningEnd') {
      req.estPlanningEnd = addYear(planningEnd);
    } else if (type === 'constructionEnd' || type === 'overlap') {
      req.estConstructionEnd = addYear(constructionEnd);
    }
  };

  const updateStartOrEndDateIfEdgeCell = () => {
    if (!isEdgeCell) {
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

  updateStartOrEndDateIfEdgeCell();
  setNextFinanceToZeroIfNull();

  return req;
};

const moveTimelineForward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
  const { planningEnd, constructionEnd, planningStart, constructionStart } = cell;
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

  if (planningEnd) {
    req.estPlanningStart = addYear(planningStart);
    req.estPlanningEnd = addYear(planningEnd);
  }

  if (constructionEnd) {
    req.estConstructionStart = addYear(constructionStart);
    req.estConstructionEnd = addYear(constructionEnd);
  }

  return req;
};

const moveTimelineBackward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
  const { planningEnd, constructionEnd, planningStart, constructionStart } = cell;
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

  if (planningEnd) {
    req.estPlanningStart = removeYear(planningStart);
    req.estPlanningEnd = removeYear(planningEnd);
  }

  if (constructionEnd) {
    req.estConstructionStart = removeYear(constructionStart);
    req.estConstructionEnd = removeYear(constructionEnd);
  }

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
  selectedYear: number | null;
}

interface IProjectCellState {
  isReadOnly: boolean;
  formValue: number | null | string;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell, projectFinances, selectedYear }) => {
  const {
    budget,
    type,
    financeKey,
    year,
    growDirections,
    id,
    title,
    startYear,
    monthlyDataList,
    hasEstimatedDates,
  } = cell;
  const cellRef = useRef<HTMLTableCellElement>(null);

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
      const request: IProjectRequest = {};
      console.log('request: ', req);

      if (!hasEstimatedDates) {
        if (Object.prototype.hasOwnProperty.call(req, 'estPlanningStart')) {
          request.planningStartYear = getYear(req.estPlanningStart).toString();
        }
        if (Object.prototype.hasOwnProperty.call(req, 'estConstructionEnd')) {
          request.constructionEndYear = getYear(req.estConstructionEnd).toString();
        }
      } else {
        Object.assign(request, { ...req });
      }
      patchProject({
        id,
        data: { ...request },
      }).catch(Promise.reject);
    },
    [id],
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
        },
      });
    },
    [onRemoveCell, onEditCell, cellTypeClass, year, title],
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
      {selectedYearClass && (
        <ProjectYearSummary
          year={year}
          startYear={startYear}
          monthlyDataList={monthlyDataList}
          cellType={cellTypeClass}
        />
      )}
    </>
  );
};

export default memo(ProjectCell);
