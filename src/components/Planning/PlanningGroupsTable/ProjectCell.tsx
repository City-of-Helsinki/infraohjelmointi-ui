import { useAppDispatch } from '@/hooks/common';
import { CellType, ContextMenuType } from '@/interfaces/common';
import { IProject, IProjectRequestObject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { IconAngleLeft } from 'hds-react/icons';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo } from 'react';
import { addYear, removeYear } from '@/utils/dates';
import { addActiveClassToProjectRow } from '@/utils/common';

export interface IProjectCellProps {
  value: string;
  cellType: CellType;
  budgetKey: string;
  project: IProject;
  year: number;
  cellSibling?: 'left' | 'right' | 'leftAndRight' | 'none';
}

const ProjectCell: FC<IProjectCellProps> = ({
  value,
  cellType,
  budgetKey,
  project,
  year,
  cellSibling,
}) => {
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<'' | number>(parseInt(value || ''));
  const isEmptyCell = cellType === 'none';

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
      dispatch(silentPatchProjectThunk({ id: project.id, data }));
    }
  }, [dispatch, formValue, isReadOnly, budgetKey, project.id, value]);

  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        year,
        project,
        cellType,
        budgetKey: budgetKey,
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
      });
    },
    [budgetKey, project, cellType, year],
  );

  const handleAddYear = useCallback(() => {
    const req: IProjectRequestObject = { id: project.id, data: {} };
    if (cellSibling === 'left' && cellType === 'construction') {
      req.data.estConstructionEnd = addYear(project.estConstructionEnd);
    }
    if (cellSibling === 'right' && cellType === 'construction') {
      req.data.estConstructionStart = removeYear(project.estConstructionStart);
    }
    if (cellSibling === 'left' && cellType === 'planning') {
      req.data.estPlanningEnd = addYear(project.estPlanningEnd);
    }
    if (cellSibling === 'right' && cellType === 'planning') {
      req.data.estPlanningStart = removeYear(project.estPlanningStart);
    }
    dispatch(silentPatchProjectThunk(req)).then((res) => {
      res.type === 'project/silent-patch/fulfilled' && addActiveClassToProjectRow(project.id);
    });
  }, [dispatch, project.estPlanningStart, project.id, cellSibling, cellType]);

  useEffect(() => {
    if (project[budgetKey as keyof IProject] as string) {
      setFormValue(parseInt(project[budgetKey as keyof IProject] as string));
    }
  }, [project]);

  return (
    <td
      className={`project-cell ${cellType}`}
      onContextMenu={!isEmptyCell ? handleOpenContextMenu : undefined}
    >
      <NumberInput
        value={!isEmptyCell ? formValue || 0 : ''}
        id={`${budgetKey}-${project.id}`}
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
        disabled={isEmptyCell}
      />
      {cellSibling !== 'none' && (
        <button className={`edit-timeline-button ${cellSibling}`} onClick={handleAddYear}>
          <IconAngleLeft />
        </button>
      )}
      {cellSibling === 'leftAndRight' && (
        <>
          <button className={`edit-timeline-button left`} onClick={handleAddYear}>
            <IconAngleLeft />
          </button>
          <button className={`edit-timeline-button right`} onClick={handleAddYear}>
            <IconAngleLeft />
          </button>
        </>
      )}
    </td>
  );
};

export default memo(ProjectCell);
