import { useAppDispatch } from '@/hooks/common';
import { CellType, ContextMenuType } from '@/interfaces/common';
import { IProject, IProjectRequest } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { IconAngleLeft } from 'hds-react/icons';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo, useRef } from 'react';
import { addYear, removeYear } from '@/utils/dates';

const addActiveClassToProjectRow = (projectId: string) => {
  document.getElementById(`row-${projectId}`)?.classList.add('active');
};

const removeActiveClassFromProjectRow = (projectId: string) => {
  document.getElementById(`row-${projectId}`)?.classList.remove('active');
};

const isProjectRowActive = (projectId: string) =>
  document.getElementById(`row-${projectId}`)?.classList.contains('active');

const isNotFirstYear = (year: number) => {
  return new Date().getFullYear() !== year;
};

const isNotLastYear = (year: number) => {
  return new Date().getFullYear() + 10 !== year;
};
/**
 * Returns the budget key next to the given key, if the previous parameter is given then the previous
 * key will be returned, otherwise the next key is returned.
 *
 * @param budgetKey the budget key to compare
 * @param previous optional boolean if the previous year should be used
 */
const getNextBudgetKey = (budgetKey: string, previous?: boolean) => {
  const splitKey = budgetKey.split('Plus');
  const baseKey = `${splitKey[0]}Plus`;
  return `${baseKey}${previous ? parseInt(splitKey[1]) - 1 : parseInt(splitKey[1]) + 1}`;
};

/**
 * Moves the value of the given budget key to either the next property or the previous property if the
 * previous parameter is given.
 *
 * @param budgetKey the current budget key which value will be moved
 * @param project the project to update
 * @param previous optional boolean if the previous year should be used
 *
 * @returns IProjectRequest-object with the given key/properties budget moved to the next property
 */
const moveBudgetToNextProperty = (
  budgetKey: string,
  project: IProject,
  previous?: boolean,
): IProjectRequest => {
  // The project properties go from budgetProposal...0, 1, 2 and then preliminaryCurrent...3, 4, 5...,
  // so we need to check if the next property would become a property that doesn't exist
  // (i.e. budgetProposalCurrentYearPlus3 or preliminaryCurrentYearPlus2)
  const nextKey = getNextBudgetKey(budgetKey, previous);
  const req = {} as IProjectRequest;

  // Check if the last cell is removed
  const isLastCell = () =>
    Array.from(document.getElementById(`row-${project.id}`)?.children || []).filter(
      (c) => c.tagName !== 'TH' && !c.classList.contains('none'),
    ).length === 1;

  // Remove the value completely if it's the last cell
  if (!isLastCell()) {
    if (nextKey === 'preliminaryCurrentYearPlus2') {
      req.budgetProposalCurrentYearPlus2 = (
        parseInt(project.budgetProposalCurrentYearPlus2) +
        parseInt(project.preliminaryCurrentYearPlus3)
      ).toString();
    } else if (nextKey === 'budgetProposalCurrentYearPlus3') {
      req.preliminaryCurrentYearPlus3 = (
        parseInt(project.budgetProposalCurrentYearPlus2) +
        parseInt(project.preliminaryCurrentYearPlus3)
      ).toString();
    } else {
      (req[nextKey as keyof IProjectRequest] as string) = (
        parseInt(project[budgetKey as keyof IProject] as string) +
        parseInt(project[nextKey as keyof IProject] as string)
      ).toString();
    }
  }
  return {
    ...req,
    [budgetKey]: '0',
  };
};

const getRemoveRequestData = (
  growDirections: Array<ProjectCellGrowDirection>,
  cellType: CellType,
  project: IProject,
  budgetKey: string,
): IProjectRequest => {
  const growLeft = growDirections[0] === 'left';

  const isPlanning = cellType === 'planning';
  const isConstruction = cellType === 'construction';
  const isOverlap = cellType === 'overlap';

  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd } = project;
  const req: IProjectRequest = {};

  // Check if the cell is the last of its type
  const amountOfType = (type: CellType) =>
    Array.from(document.getElementById(`row-${project.id}`)?.children || []).filter((c) =>
      c.classList.contains(type),
    ).length;

  // If the cell is construction and there are no more overlap cells and its the last of its type, null both construction dates
  if (
    (amountOfType('construction') === 1 && amountOfType('overlap') === 0 && isConstruction) ||
    (amountOfType('construction') === 0 && amountOfType('overlap') === 1 && isOverlap)
  ) {
    req.estConstructionStart = null;
    req.estConstructionEnd = null;
  }
  // If the cell is planning and there are no more overlap cells and its the last of its type, null both planning dates
  else if (
    (amountOfType('planning') === 1 && amountOfType('overlap') === 0 && isPlanning) ||
    (amountOfType('planning') === 0 && amountOfType('overlap') === 1 && isOverlap)
  ) {
    req.estPlanningStart = null;
    req.estPlanningEnd = null;
  }
  // If the cell is an overlap cell and it's the last cell, remove all start and end dates
  else if (amountOfType('overlap') === 1 && growDirections.length === 2) {
    req.estPlanningStart = null;
    req.estPlanningEnd = null;
    req.estConstructionStart = null;
    req.estConstructionEnd = null;
  }
  // If it's a planning cell add a year from the left or remove a year from the right
  else if (isPlanning) {
    if (growLeft) req.estPlanningStart = addYear(estPlanningStart);
    else req.estPlanningEnd = removeYear(estPlanningEnd);
  }
  // If it's an construction cell add a year from the left or remove a year from the right
  else if (isConstruction) {
    if (growLeft) req.estConstructionStart = addYear(estConstructionStart);
    else req.estConstructionEnd = removeYear(estConstructionEnd);
  }
  // If it's an overlap cell, decrease both construction and planning
  else if (isOverlap) {
    if (growLeft) req.estPlanningStart = addYear(estPlanningStart);
    else req.estPlanningEnd = removeYear(estPlanningEnd);
  }

  return { ...req, ...moveBudgetToNextProperty(budgetKey, project, growDirections[0] === 'right') };
};

const getAddRequestData = (project: IProject, cellType: CellType, direction: string) => {
  const isPlanning = cellType === 'planning';
  const isConstruction = cellType === 'construction';
  const isOverlap = cellType === 'overlap';

  const { estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd } = project;

  if (direction === 'left' && (isPlanning || isOverlap)) {
    return { estPlanningStart: removeYear(estPlanningStart) };
  }
  if (direction === 'right' && isPlanning) {
    return { estPlanningEnd: addYear(estPlanningEnd) };
  }
  if (direction === 'left' && isConstruction) {
    return { estConstructionStart: removeYear(estConstructionStart) };
  }
  if (direction === 'right' && (isConstruction || isOverlap)) {
    return { estConstructionEnd: addYear(estConstructionEnd) };
  }
};

type ProjectCellGrowDirection = 'left' | 'right';

export interface IProjectCellProps {
  value: string;
  cellType: CellType;
  budgetKey: string;
  project: IProject;
  year: number;
  growDirections: Array<ProjectCellGrowDirection>;
}

/**
 * This component relies on the project budget properties for the current year and the next 10 years to be the following,
 * since it adds/removes values from them dynamically using the number at the end of the key:
 *
 * - budgetProposalCurrentYearPlus0 (current year)
 * - ...
 * - budgetProposalCurrentYearPlus2
 * - preliminaryCurrentYearPlus3
 * - ...
 * - preliminaryCurrentYearPlus10 (10 years in the future)
 *
 */
const ProjectCell: FC<IProjectCellProps> = ({
  value,
  cellType,
  budgetKey,
  project,
  year,
  growDirections,
}) => {
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<'' | number>(parseInt(value || ''));
  const isEmptyCell = cellType === 'none';
  const cellRef = useRef<HTMLTableCellElement>(null);

  const { id, name } = project;

  const handleFocus = useCallback(() => {
    setIsReadOnly((current) => !current);
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValue(parseInt(e.target.value));
  }, []);

  const handleBlur = useCallback(() => {
    const data = { [budgetKey]: formValue };
    setIsReadOnly(!isReadOnly);
    if (formValue !== parseInt(value)) {
      dispatch(silentPatchProjectThunk({ id, data }));
    }
  }, [dispatch, formValue, isReadOnly, budgetKey, id, value]);

  const onRemoveCell = useCallback(() => {
    dispatch(
      silentPatchProjectThunk({
        id,
        data: { ...getRemoveRequestData(growDirections, cellType, project, budgetKey) },
      }),
    );
  }, [budgetKey, cellType, dispatch, growDirections, id, project]);

  const onAddYear = useCallback(
    (direction: ProjectCellGrowDirection) => {
      dispatch(
        silentPatchProjectThunk({
          id,
          data: { ...getAddRequestData(project, cellType, direction) },
        }),
      );
    },
    [id, project, cellType, dispatch],
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
        title: name,
        cellType,
        onRemoveCell,
        onEditCell,
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
        isRemoveable: growDirections.length > 0,
      });
    },
    [year, name, cellType, onRemoveCell, onEditCell],
  );

  useEffect(() => {
    if (project[budgetKey as keyof IProject] as string) {
      setFormValue(parseInt(project[budgetKey as keyof IProject] as string));
    }
  }, [project]);

  return (
    <td
      ref={cellRef}
      id={`cell-${id}-${budgetKey}`}
      className={`project-cell ${cellType}`}
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
      {isNotFirstYear(year) &&
        isNotLastYear(year) &&
        growDirections.map((d) => (
          <button key={d} className={`edit-timeline-button ${d}`} onClick={() => onAddYear(d)}>
            <IconAngleLeft />
          </button>
        ))}
    </td>
  );
};

export default memo(ProjectCell);
