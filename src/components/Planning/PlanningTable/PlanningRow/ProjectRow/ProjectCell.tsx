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
import { addYear, removeYear, updateYear } from '@/utils/dates';
import EditTimelineButton from './EditTimelineButton';
import { ContextMenuType } from '@/interfaces/eventInterfaces';

const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`project-row-${projectId}`)?.classList.add('active');
};

const getRemoveRequestData = (cell: IProjectCell): IProjectRequest => {
  const {
    type,
    isEndOfTimeline,
    isStartOfTimeline,
    isLastOfType,
    planStart,
    planEnd,
    conStart,
    conEnd,
    cellToUpdate,
    financesToReset,
    financeKey,
    budget,
    isEdgeCell,
    startYear,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear, ...financesToReset } };

  const updatePlanEnd = () => {
    if (!isLastOfType) {
      req.estPlanningEnd = updateYear(cellToUpdate?.year, planEnd);
    } else {
      req.estPlanningStart = null;
      req.estPlanningEnd = null;
    }
  };

  const updateConEnd = () => {
    if (!isLastOfType) {
      req.estConstructionEnd = updateYear(cellToUpdate?.year, conEnd);
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
      req.estPlanningEnd = removeYear(planEnd);
    }
    if (isEndOfTimeline) {
      req.estConstructionStart = null;
      req.estConstructionEnd = null;
    } else {
      req.estConstructionStart = addYear(conStart);
    }
  };

  const updateDatesIfStartEndOrOverlap = () => {
    switch (type) {
      case 'planStart':
        req.estPlanningStart = updateYear(cellToUpdate?.year, planStart);
        break;
      case 'planEnd':
        updatePlanEnd();
        break;
      case 'conStart':
        req.estConstructionStart = updateYear(cellToUpdate?.year, conStart);
        break;
      case 'conEnd':
        updateConEnd();
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
    planStart,
    planEnd,
    conStart,
    conEnd,
    next,
    prev,
    isLastOfType,
    startYear,
    isEdgeCell,
    isStartOfTimeline,
  } = cell;

  const req: IProjectRequest = { finances: { year: startYear } };

  const updateLeft = () => {
    if (isStartOfTimeline && (type === 'planStart' || type === 'planEnd' || type === 'overlap')) {
      req.estPlanningStart = removeYear(planStart);
    } else if ((isLastOfType && type === 'conEnd') || type === 'conStart') {
      req.estConstructionStart = removeYear(conStart);
    }
  };

  const updateRight = () => {
    if (type === 'planEnd') {
      req.estPlanningEnd = addYear(planEnd);
    } else if (type === 'conEnd' || type === 'overlap') {
      req.estConstructionEnd = addYear(conEnd);
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
  const { planEnd, conEnd, planStart, conStart } = cell;
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

  if (planEnd) {
    req.estPlanningStart = addYear(planStart);
    req.estPlanningEnd = addYear(planEnd);
  }

  if (conEnd) {
    req.estConstructionStart = addYear(conStart);
    req.estConstructionEnd = addYear(conEnd);
  }

  return req;
};

const moveTimelineBackward = (cell: IProjectCell, projectFinances: IProjectFinances) => {
  const { planEnd, conEnd, planStart, conStart } = cell;
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

  if (planEnd) {
    req.estPlanningStart = removeYear(planStart);
    req.estPlanningEnd = removeYear(planEnd);
  }

  if (conEnd) {
    req.estConstructionStart = removeYear(conStart);
    req.estConstructionEnd = removeYear(conEnd);
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
  isSelectedYear: boolean;
  formValue: number | null | string;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell, projectFinances, selectedYear }) => {
  const { budget, type, financeKey, year, growDirections, id, title } = cell;
  const cellRef = useRef<HTMLTableCellElement>(null);

  const [projectCellState, setProjectCellState] = useState<IProjectCellState>({
    isReadOnly: true,
    isSelectedYear: false,
    formValue: parseInt(budget ?? '0'),
  });

  const { formValue, isSelectedYear, isReadOnly } = projectCellState;

  // Values of cells that have the none type will be empty strings to hide them
  const formDisplayValue = useMemo(
    () => (type !== 'none' ? formValue?.toString() : ''),
    [formValue, type],
  );

  const updateCell = useCallback(
    (req: IProjectRequest) => {
      if (req.finances && Object.keys(req.finances).length === 1) {
        delete req.finances;
      }
      patchProject({
        id,
        data: { ...req },
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
  const getCssType = useCallback(() => {
    if (type.includes('plan')) return 'plan';
    else if (type.includes('con')) return 'con';
    else return type;
  }, [type]);

  // Open the custom context menu when right-clicking a cell
  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
        cellMenuProps: {
          year,
          title,
          cellType: getCssType(),
          onRemoveCell,
          onEditCell,
        },
      });
    },
    [onRemoveCell, onEditCell, getCssType, year, title],
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
        className={`project-cell ${getCssType()}`}
        onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
        data-testid={`project-cell-${year}-${id}`}
      >
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
      {year === selectedYear && (
        <td key={`${year}-monthly-view`} className="h-28 !min-w-[500px]">
          <span className="text-sm font-light">{'Monthly view cell'}</span>
        </td>
      )}
    </>
  );
};

export default memo(ProjectCell);
