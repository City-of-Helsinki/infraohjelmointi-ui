import { useAppDispatch } from '@/hooks/common';
import { ContextMenuType } from '@/interfaces/common';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo, useRef } from 'react';
import { addYear, removeYear, updateYear } from '@/utils/dates';
import { IProjectCell, ProjectCellGrowDirection } from '@/hooks/useProjectCell';
import _ from 'lodash';
import EditTimelineButton from './EditTimelineButton';

const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`row-${projectId}`)?.classList.add('active');
};

const removeActiveClassFromProjectRow = (projectId: string) => {
  document.getElementById(`row-${projectId}`)?.classList.remove('active');
};

const isProjectRowActive = (projectId: string) =>
  document.getElementById(`row-${projectId}`)?.classList.contains('active');

const getRemoveRequestData = (cell: IProjectCell): IProjectRequest => {
  const {
    type,
    isEndOfTimeline,
    isStartOfTimeline,
    isLastOfType,
    startForType,
    endForType,
    cellToUpdate,
    keysToReset,
    budgetKey,
    budget,
    isEdgeCell,
  } = cell;

  const req: IProjectRequest = {};

  // If it's the last cell of its type (plan/con/overflow)
  if (isLastOfType) {
    switch (type) {
      case 'estPlanningEnd':
        req.estPlanningStart = null;
        req.estPlanningEnd = null;
        break;
      case 'estConstructionEnd':
        req.estConstructionStart = null;
        req.estConstructionEnd = null;
        break;
      default:
        if (isStartOfTimeline) {
          req.estPlanningStart = null;
          req.estPlanningEnd = null;
        }
        if (isEndOfTimeline) {
          req.estConstructionStart = null;
          req.estConstructionEnd = null;
        }
    }
  }
  // Else if it's plan/con start/end or an overlap cell
  else {
    switch (type) {
      case 'estPlanningStart':
      case 'estConstructionStart':
        req[type] = updateYear(startForType, cellToUpdate?.year);
        break;
      case 'estPlanningEnd':
      case 'estConstructionEnd':
        req[type] = updateYear(endForType, cellToUpdate?.year);
        break;
      case 'overlap':
        req.estPlanningEnd = removeYear(endForType);
        req.estConstructionStart = addYear(startForType);
        break;
    }
  }

  // If there is a cellToUpdate move the deleted cells budget to that cell
  if (cellToUpdate) {
    const updateKey = cellToUpdate.budgetKey;
    const updateBudget = cellToUpdate.budget;
    req[updateKey] = (parseInt(budget || '0') + parseInt(updateBudget || '0')).toString();
  }
  // If there are keys to reset, use those keys to add '0' values back
  if (keysToReset.length > 0) {
    keysToReset.forEach((ktr) => (req[ktr] = '0'));
  }

  (req[budgetKey as keyof IProjectRequest] as string | null) = isEdgeCell ? '0' : null;

  return req;
};

const getAddRequestData = (direction: string, cell: IProjectCell) => {
  const { type, startForType, endForType, next, prev, isStartOfTimeline, isLastOfType } = cell;

  const req: IProjectRequest = {};

  if (
    direction === 'left' &&
    isStartOfTimeline &&
    (type === 'estPlanningStart' || type === 'estPlanningEnd' || type === 'overlap')
  ) {
    req.estPlanningStart = removeYear(startForType);
  } else if (
    (direction === 'left' && type === 'estConstructionStart') ||
    (type === 'estConstructionEnd' && isLastOfType)
  ) {
    req.estConstructionStart = removeYear(startForType);
  } else if (direction === 'right' && type === 'estPlanningEnd') {
    req.estPlanningEnd = addYear(endForType);
  } else if (direction === 'right' && (type === 'estConstructionEnd' || type === 'overlap')) {
    req.estConstructionEnd = addYear(endForType);
  }

  if (_.isEmpty(req)) {
    const nextBudget = direction === 'right' ? next : prev;
    if (nextBudget !== null) {
      (req[nextBudget.budgetKey as keyof IProjectRequest] as string) = '0';
    }
  }

  return req;
};

const getMoveTimelineRequestData = (cell: IProjectCell, direction: string) => {
  const {
    isEndOfTimeline,
    isStartOfTimeline,
    estPlanningEnd,
    estPlanningStart,
    estConstructionEnd,
    estConstructionStart,
    allBudgets,
  } = cell;

  const req: IProjectRequest = {};
  const nextBudgets = [...allBudgets];

  // Move the timeline FORWARD by one year if direction is RIGHT and it's the LAST cell
  if (isEndOfTimeline && direction === 'right') {
    if (estPlanningEnd) {
      req.estPlanningStart = addYear(estPlanningStart);
      req.estPlanningEnd = addYear(estPlanningEnd);
    }
    if (estConstructionEnd) {
      req.estConstructionStart = addYear(estConstructionStart);
      req.estConstructionEnd = addYear(estConstructionEnd);
    }

    for (let i = nextBudgets.length - 1; i >= 0; i--) {
      if (i !== nextBudgets.length - 1) {
        nextBudgets[i + 1][1] = nextBudgets[i][1];
      }
    }

    nextBudgets.slice(0).forEach((b) => {
      (req[b[0] as keyof IProjectRequest] as string) = b[1];
    });
  }
  // Move the timeline BACKWARD by one year if direction is LEFT and it's the FIRST cell
  else if (isStartOfTimeline && direction === 'left') {
    if (estPlanningEnd) {
      req.estPlanningStart = removeYear(estPlanningStart);
      req.estPlanningEnd = removeYear(estPlanningEnd);
    }
    if (estConstructionEnd) {
      req.estConstructionStart = removeYear(estConstructionStart);
      req.estConstructionEnd = removeYear(estConstructionEnd);
    }

    for (let i = 1; i < nextBudgets.length; i++) {
      nextBudgets[i - 1][1] = nextBudgets[i][1];
    }

    nextBudgets.forEach((b) => {
      (req[b[0] as keyof IProjectRequest] as string) = b[1];
    });
  }

  return req;
};

interface IProjectCellProps {
  cell: IProjectCell;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell }) => {
  const { budget, type, budgetKey, year, growDirections, id, title, prev, next } = cell;
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<'' | number>(parseInt(budget || ''));
  const cellRef = useRef<HTMLTableCellElement>(null);

  const handleFocus = useCallback(() => {
    setIsReadOnly((current) => !current);
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValue(parseInt(e.target.value));
  }, []);

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

  const handleBlur = useCallback(() => {
    setIsReadOnly(!isReadOnly);
    if (formValue !== parseInt(budget)) {
      updateCell({ [budgetKey]: formValue });
    }
  }, [isReadOnly, formValue, budget, updateCell, budgetKey]);

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

  const onEditCell = useCallback(() => {
    if (isProjectRowActive(id)) {
      removeActiveClassFromProjectRow(id);
    } else {
      addActiveClassToProjectRow(id);
    }
  }, [id]);

  const getCssType = useCallback(() => {
    if (type.includes('Planning')) return 'planning';
    else if (type.includes('Construction')) return 'construction';
    else return type;
  }, [type]);

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

  useEffect(() => {
    budget && setFormValue(parseInt(budget));
  }, [budget]);

  return (
    <td
      ref={cellRef}
      id={`cell-${id}-${budgetKey}`}
      className={`project-cell ${getCssType()}`}
      onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
    >
      <NumberInput
        value={type !== 'none' ? formValue || 0 : ''}
        id={`${budgetKey}-${id}`}
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
        disabled={type === 'none'}
      />
      {prev &&
        next &&
        growDirections.map((d) => (
          <EditTimelineButton
            key={d}
            direction={d}
            onSingleClick={onAddYear}
            onDoubleClick={onMoveTimeline}
          />
        ))}
    </td>
  );
};

export default memo(ProjectCell);
