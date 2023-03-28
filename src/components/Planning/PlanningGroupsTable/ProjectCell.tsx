import { useAppDispatch } from '@/hooks/common';
import { ContextMenuType } from '@/interfaces/common';
import { IProjectRequest } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { IconAngleLeft } from 'hds-react/icons';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo, useRef } from 'react';
import { addYear, removeYear, updateYear } from '@/utils/dates';
import { ProjectCellGrowDirection } from './PlanningGroupsTableRow';
import { IProjectCell } from '@/hooks/useProjectCell';
import _ from 'lodash';

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
    start,
    end,
    cellToUpdate,
    keysToReset,
    budgetKey,
    budget,
  } = cell;

  const req: IProjectRequest = {};

  // Moves the value of the given budget key to the next budget key given
  const moveBudgetToNextProperty = (budgetKey: string): IProjectRequest => {
    const request = {} as IProjectRequest;

    const isEdgeCell =
      type.includes('Start') ||
      type.includes('End') ||
      isLastOfType ||
      isStartOfTimeline ||
      isEndOfTimeline;

    if (cellToUpdate) {
      (request[cellToUpdate.budgetKey as keyof IProjectRequest] as string) = (
        parseInt(budget || '0') + parseInt(cellToUpdate.budget || '0')
      ).toString();

      if (keysToReset) {
        keysToReset.forEach((ktr) => {
          (request[ktr as keyof IProjectRequest] as string) = '0';
        });
      }
    }

    return {
      ...request,
      [budgetKey]: isEdgeCell ? '0' : null,
    };
  };

  // Makes sure that the start date never overlaps the end date
  const removeStartAndEndIfLastOfType = () => {
    if (isLastOfType) {
      if (type === 'estPlanningEnd') {
        req.estPlanningStart = null;
        req.estPlanningEnd = null;
      } else if (type === 'estConstructionEnd') {
        req.estConstructionStart = null;
        req.estConstructionEnd = null;
      } else if (isStartOfTimeline && isEndOfTimeline) {
        req.estPlanningStart = null;
        req.estPlanningEnd = null;
        req.estConstructionStart = null;
        req.estConstructionEnd = null;
      }
    }
  };

  const setNewStartOrEndIfEdgeCellIsRemoved = () => {
    if (type === 'estPlanningStart' || type === 'estConstructionStart') {
      req[type] = updateYear(start, cellToUpdate?.year);
    }
    if (type === 'estPlanningEnd' || type === 'estConstructionEnd') {
      req[type] = updateYear(end, cellToUpdate?.year);
    }
    if (type === 'overlap' && isLastOfType) {
      if (isStartOfTimeline) {
        req.estPlanningEnd = null;
        req.estPlanningStart = null;
        req.estConstructionStart = addYear(start);
      } else if (isEndOfTimeline) {
        req.estConstructionStart = null;
        req.estConstructionEnd = null;
        req.estPlanningEnd = removeYear(end);
      } else {
        req.estPlanningEnd = removeYear(end);
        req.estConstructionStart = addYear(start);
      }
    }
  };

  setNewStartOrEndIfEdgeCellIsRemoved();
  removeStartAndEndIfLastOfType();

  return {
    ...req,
    ...moveBudgetToNextProperty(budgetKey),
  };
};

const getAddRequestData = (direction: string, budget: IProjectCell) => {
  const { type, start, end, next, prev, isStartOfTimeline, isLastOfType } = budget;

  const req: IProjectRequest = {};

  if (
    direction === 'left' &&
    isStartOfTimeline &&
    (type === 'estPlanningStart' || type === 'estPlanningEnd' || type === 'overlap')
  ) {
    req.estPlanningStart = removeYear(start);
  } else if (
    (direction === 'left' && type === 'estConstructionStart') ||
    (type === 'estConstructionEnd' && isLastOfType)
  ) {
    req.estConstructionStart = removeYear(start);
  } else if (direction === 'right' && type === 'estPlanningEnd') {
    req.estPlanningEnd = addYear(end);
  } else if (direction === 'right' && (type === 'estConstructionEnd' || type === 'overlap')) {
    req.estConstructionEnd = addYear(end);
  }

  if (_.isEmpty(req)) {
    const nextBudget = direction === 'right' ? next : prev;
    if (nextBudget !== null) {
      (req[nextBudget.budgetKey as keyof IProjectRequest] as string) = '0';
    }
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
  const isEmptyCell = type === 'none' || budget === null;
  const cellRef = useRef<HTMLTableCellElement>(null);

  const handleFocus = useCallback(() => {
    setIsReadOnly((current) => !current);
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValue(parseInt(e.target.value));
  }, []);

  const updateCell = (req: IProjectRequest) => {
    dispatch(
      silentPatchProjectThunk({
        id,
        data: { ...req },
      }),
    );
  };

  const handleBlur = useCallback(() => {
    setIsReadOnly(!isReadOnly);
    if (formValue !== parseInt(budget)) {
      updateCell({ [budgetKey]: formValue });
    }
  }, [dispatch, formValue, isReadOnly, budgetKey, budget]);

  const onRemoveCell = useCallback(() => {
    updateCell(getRemoveRequestData(cell));
  }, [dispatch, cell]);

  const onAddYear = useCallback(
    (event: MouseEvent, direction: ProjectCellGrowDirection) => {
      if (event.detail == 2) {
        console.log('double click');
      } else {
        updateCell(getAddRequestData(direction, cell));
      }
    },
    [dispatch, cell],
  );

  const onEditCell = useCallback(() => {
    if (isProjectRowActive(id)) {
      removeActiveClassFromProjectRow(id);
    } else {
      addActiveClassToProjectRow(id);
    }
  }, [id]);

  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        year,
        title,
        cellType: type,
        onRemoveCell,
        onEditCell,
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
      });
    },
    [onRemoveCell, onEditCell, year, type, title],
  );

  useEffect(() => {
    if (budget) {
      setFormValue(parseInt(budget));
    }
  }, [budget]);

  const getCssType = () => {
    if (!isEmptyCell) {
      if (type.toLocaleLowerCase().includes('planning')) {
        return 'planning';
      } else if (type.toLocaleLowerCase().includes('construction')) {
        return 'construction';
      } else {
        return 'overlap';
      }
    } else {
      return 'none';
    }
  };

  return (
    <td
      ref={cellRef}
      id={`cell-${id}-${budgetKey}`}
      className={`project-cell ${getCssType()}`}
      onContextMenu={!isEmptyCell ? handleOpenContextMenu : undefined}
    >
      <NumberInput
        value={!isEmptyCell ? formValue || 0 : ''}
        id={`${budgetKey}-${id}`}
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
        disabled={isEmptyCell}
      />
      {prev &&
        next &&
        growDirections.map((d) => (
          <button key={d} className={`edit-timeline-button ${d}`} onClick={(e) => onAddYear(e, d)}>
            <IconAngleLeft />
          </button>
        ))}
    </td>
  );
};

export default memo(ProjectCell);
