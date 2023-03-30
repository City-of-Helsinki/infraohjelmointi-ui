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
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo, useRef } from 'react';
import { addYear, removeYear, updateYear } from '@/utils/dates';
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
    planStart,
    planEnd,
    conStart,
    conEnd,
    cellToUpdate,
    financesToReset,
    financeKey,
    budget,
    isEdgeCell,
  } = cell;

  const req: IProjectRequest = {};
  const finances: IProjectFinancesRequestObject = { year: 2023 };

  // If it's the last cell of its type (plan/con/overflow)
  if (isLastOfType) {
    switch (type) {
      case 'planEnd':
        req.estPlanningStart = null;
        req.estPlanningEnd = null;
        break;
      case 'conEnd':
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
      case 'planStart':
        req.estPlanningStart = updateYear(planStart, cellToUpdate?.year);
        break;
      case 'planEnd':
        req.estPlanningEnd = updateYear(planEnd, cellToUpdate?.year);
        break;
      case 'conStart':
        req.estConstructionStart = updateYear(conStart, cellToUpdate?.year);
        break;
      case 'conEnd':
        req.estConstructionEnd = updateYear(conEnd, cellToUpdate?.year);
        break;
      case 'overlap':
        req.estPlanningEnd = removeYear(planEnd);
        req.estConstructionStart = addYear(conStart);
        break;
    }
  }

  // If there is a cellToUpdate move the deleted cells budget to that cell
  if (cellToUpdate) {
    const updateKey = cellToUpdate.financeKey;
    const updateBudget = cellToUpdate.budget;
    (finances[updateKey as keyof IProjectFinancesRequestObject] as string) = (
      parseInt(budget || '0') + parseInt(updateBudget || '0')
    ).toString();
  }

  // Set the current cells value to '0' if it's an edge cell, otherwise set it to null to temporarily hide it
  (finances[financeKey as keyof IProjectFinancesRequestObject] as string | null) = isEdgeCell
    ? '0'
    : null;

  return { ...req, finances: { ...finances, ...financesToReset } };
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
    isStartOfTimeline,
    isLastOfType,
  } = cell;

  const req: IProjectRequest = {};

  switch (direction) {
    case 'left':
      if (isStartOfTimeline && (type === 'planStart' || type === 'planEnd' || type === 'overlap')) {
        req.estPlanningStart = removeYear(planStart);
      }
      if ((isLastOfType && type === 'conEnd') || type === 'conStart') {
        req.estConstructionStart = removeYear(conStart);
      }
      break;
    case 'right':
      if (type === 'planEnd') {
        req.estPlanningEnd = addYear(planEnd);
      }
      if (type === 'conEnd' || type === 'overlap') {
        req.estConstructionEnd = addYear(conEnd);
      }
      break;
  }

  if (_.isEmpty(req)) {
    const nextBudget = direction === 'right' ? next : prev;
    if (nextBudget !== null) {
      (req[nextBudget.financeKey as keyof IProjectRequest] as string) = '0';
    }
  }

  return req;
};

const getMoveTimelineRequestData = (cell: IProjectCell, direction: string) => {
  const { isEndOfTimeline, isStartOfTimeline, planEnd, planStart, conStart, conEnd, financesList } =
    cell;

  const req: IProjectRequest = {};
  const finances: IProjectFinancesRequestObject = { year: 2023 };
  const nextFinances = [...financesList];

  // Move the timeline FORWARD by one year if direction is RIGHT and it's the LAST cell
  if (isEndOfTimeline && direction === 'right') {
    if (planStart) {
      req.estPlanningStart = addYear(planStart);
      req.estPlanningEnd = addYear(planEnd);
    }
    if (conEnd) {
      req.estConstructionStart = addYear(conStart);
      req.estConstructionEnd = addYear(conEnd);
    }

    for (let i = nextFinances.length - 1; i >= 0; i--) {
      if (i !== nextFinances.length - 1) {
        nextFinances[i + 1][1] = nextFinances[i][1];
      }
    }

    nextFinances.slice(0).forEach((f) => {
      (finances[f[0] as keyof IProjectFinancesRequestObject] as string | null) = f[1];
    });
  }
  // Move the timeline BACKWARD by one year if direction is LEFT and it's the FIRST cell
  else if (isStartOfTimeline && direction === 'left') {
    if (planEnd) {
      req.estPlanningStart = removeYear(planStart);
      req.estPlanningEnd = removeYear(planEnd);
    }
    if (conEnd) {
      req.estConstructionStart = removeYear(conStart);
      req.estConstructionEnd = removeYear(conEnd);
    }

    for (let i = 1; i < nextFinances.length; i++) {
      nextFinances[i - 1][1] = nextFinances[i][1];
    }

    nextFinances.forEach((b) => {
      (finances[b[0] as keyof IProjectFinancesRequestObject] as string | null) = b[1];
    });
  }

  return { ...req, finances };
};

interface IProjectCellProps {
  cell: IProjectCell;
}

const ProjectCell: FC<IProjectCellProps> = ({ cell }) => {
  const { budget, type, financeKey, year, growDirections, id, title, prev, next } = cell;
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
    if (formValue !== parseInt(budget || '0')) {
      updateCell({
        finances: {
          year: 2023,
          [financeKey]: formValue,
        },
      });
    }
  }, [isReadOnly, formValue, budget, updateCell, financeKey]);

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
    if (isProjectRowActive(id)) {
      removeActiveClassFromProjectRow(id);
    } else {
      addActiveClassToProjectRow(id);
    }
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
    budget && setFormValue(parseInt(budget));
  }, [budget]);

  return (
    <td
      ref={cellRef}
      className={`project-cell ${getCssType()}`}
      onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
    >
      <NumberInput
        value={type !== 'none' ? formValue || 0 : ''}
        id={`${financeKey}-${id}`}
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
