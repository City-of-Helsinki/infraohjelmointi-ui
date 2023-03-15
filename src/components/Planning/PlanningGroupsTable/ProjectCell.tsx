import { useAppDispatch } from '@/hooks/common';
import { CellType, ContextMenuType } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { IconAngleLeft } from 'hds-react/icons';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo } from 'react';
import { removeYear } from '@/utils/dates';
import { addActiveClassToProjectRow } from '@/utils/common';

export interface IProjectCellProps {
  value: string;
  cellType: CellType;
  budgetKey: string;
  project: IProject;
  year: number;
}

const ProjectCell: FC<IProjectCellProps> = ({ value, cellType, budgetKey, project, year }) => {
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
    dispatch(
      silentPatchProjectThunk({
        id: project.id,
        data: { estPlanningStart: removeYear(project.estPlanningStart) },
      }),
    ).then((res) => {
      res.type === 'project/silent-patch/fulfilled' && addActiveClassToProjectRow(project.id);
    });
  }, [dispatch, project.estPlanningStart, project.id]);

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
      <button className="edit-timeline-button" onClick={handleAddYear}>
        <IconAngleLeft />
      </button>
    </td>
  );
};

export default memo(ProjectCell);
