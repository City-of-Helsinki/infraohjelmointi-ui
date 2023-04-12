import { useAppDispatch } from '@/hooks/common';
import { ContextMenuType } from '@/interfaces/common';
import {
  IProjectCell,
  IProjectFinancesRequestObject,
  IProjectRequest,
  ProjectCellGrowDirection,
} from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo, useRef } from 'react';
import { addYear, removeYear, updateYear } from '@/utils/dates';
import EditTimelineButton from './EditTimelineButton';

const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`row-${projectId}`)?.classList.add('active');
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
        parseInt(budget || '0') + parseInt(updateBudget || '0')
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

const moveTimelineForward = (finances: Array<Array<string | null>>, cell: IProjectCell) => {
  const { planEnd, conEnd, planStart, conStart, startYear } = cell;

  const req: IProjectRequest = { finances: { year: startYear } };

  if (planEnd) {
    req.estPlanningStart = addYear(planStart);
    req.estPlanningEnd = addYear(planEnd);
  }

  if (conEnd) {
    req.estConstructionStart = addYear(conStart);
    req.estConstructionEnd = addYear(conEnd);
  }

  for (let i = finances.length - 1; i >= 0; i--) {
    if (i < finances.length - 1) {
      finances[i + 1][1] = finances[i][1];
    }
  }

  finances.slice(0).forEach((f) => {
    // TS thinks that req.finances can be undefined if this if-condition is called outside the loop...
    if (req.finances) {
      (req.finances[f[0] as keyof IProjectFinancesRequestObject] as string | null) = f[1];
    }
  });

  return req;
};

const moveTimelineBackward = (finances: Array<Array<string | null>>, cell: IProjectCell) => {
  const { planEnd, conEnd, planStart, conStart, startYear } = cell;
  const req: IProjectRequest = { finances: { year: startYear } };

  if (planEnd) {
    req.estPlanningStart = removeYear(planStart);
    req.estPlanningEnd = removeYear(planEnd);
  }

  if (conEnd) {
    req.estConstructionStart = removeYear(conStart);
    req.estConstructionEnd = removeYear(conEnd);
  }

  for (let i = 1; i < finances.length; i++) {
    finances[i - 1][1] = finances[i][1];
  }

  finances.forEach((b) => {
    // TS thinks that req.finances can be undefined if this if-condition is called outside the loop...
    if (req.finances) {
      (req.finances[b[0] as keyof IProjectFinancesRequestObject] as string | null) = b[1];
    }
  });

  return req;
};

const getMoveTimelineRequestData = (cell: IProjectCell, direction: string) => {
  const { isEndOfTimeline, isStartOfTimeline, financesList } = cell;

  let req: IProjectRequest = {};
  const nextFinances = [...financesList];

  switch (true) {
    case direction === 'right' && isEndOfTimeline:
      req = moveTimelineForward(nextFinances, cell);
      break;
    case direction === 'left' && isStartOfTimeline:
      req = moveTimelineBackward(nextFinances, cell);
      break;
  }

  return req;
};

interface IProjectCellProps {
  cell: IProjectCell;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell }) => {
  const { budget, type, financeKey, year, growDirections, id, title } = cell;
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<number | undefined>(
    type !== 'none' && budget ? parseInt(budget) : undefined,
  );
  const cellRef = useRef<HTMLTableCellElement>(null);

  const updateCell = useCallback(
    (req: IProjectRequest) => {
      dispatch(
        silentPatchProjectThunk({
          id,
          data: { ...req },
        }),
      );
    },
    [dispatch, id],
  );

  // Focusing the input field will activate the input field by switching its readOnly property
  const handleFocus = useCallback(() => {
    setIsReadOnly((current) => !current);
  }, []);

  // Make sure the budget is always at least 0 and remove the first 0 if the user types a number in the field
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setFormValue(e.target.value ? +e.target.value : 0),
    [],
  );

  // Blurring the input field will patch the current budget
  const handleBlur = useCallback(() => {
    setIsReadOnly((current) => !current);
    if (formValue !== parseInt(budget || '0')) {
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
      if (isStartOfTimeline || isEndOfTimeline) {
        updateCell(getMoveTimelineRequestData(cell, direction));
      }
    },
    [cell, updateCell],
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
        year,
        title,
        cellType: getCssType(),
        onRemoveCell,
        onEditCell,
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
      });
    },
    [onRemoveCell, onEditCell, getCssType, year, title],
  );

  // Set the budgets value to a number if it exists
  useEffect(() => {
    budget && type !== 'none' && setFormValue(parseInt(budget));
  }, [budget, type]);

  return (
    <td
      ref={cellRef}
      className={`project-cell ${getCssType()}`}
      onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
    >
      <div className="project-cell-input-container">
        <input
          value={formValue !== undefined ? formValue.toString() : ''}
          type="number"
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={type === 'none'}
          readOnly={isReadOnly}
          className="project-cell-input"
        />
        {growDirections.map((d) => (
          <EditTimelineButton
            key={d}
            direction={d}
            onSingleClick={onAddYear}
            onDoubleClick={onMoveTimeline}
          />
        ))}
      </div>
    </td>
  );
};

export default memo(ProjectCell);
