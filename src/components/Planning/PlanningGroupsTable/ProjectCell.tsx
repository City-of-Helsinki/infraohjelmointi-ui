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
  cellKey: string;
  project: IProject;
  year: number;
}

const ProjectCell: FC<IProjectCellProps> = ({ value, cellType, cellKey, project, year }) => {
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<'' | number>(parseInt(value || ''));

  const handleFocus = useCallback(() => {
    setIsReadOnly((current) => !current);
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValue(parseInt(e.target.value));
  }, []);

  const handleBlur = useCallback(() => {
    const data = { [cellKey]: formValue };
    setIsReadOnly(!isReadOnly);
    if (formValue !== parseInt(value)) {
      dispatch(silentPatchProjectThunk({ id: project.id, data }));
    }
  }, [dispatch, formValue, isReadOnly, cellKey, project.id, value]);

  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        year,
        project,
        cellType,
        cellKey: cellKey,
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
      });
    },
    [cellKey, project, cellType, year],
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
    if (project[cellKey as keyof IProject] as string) {
      setFormValue(parseInt(project[cellKey as keyof IProject] as string));
    }
  }, [project]);

  return (
    <td
      className={`project-cell ${cellType}`}
      onContextMenu={cellType !== 'none' ? handleOpenContextMenu : undefined}
    >
      <NumberInput
        value={cellType !== 'none' ? formValue || 0 : ''}
        id={`${cellKey}-${project.id}`}
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
        disabled={cellType === 'none'}
      />
      <button className="edit-timeline-button" onClick={handleAddYear}>
        <IconAngleLeft />
      </button>
    </td>
  );
};

export default memo(ProjectCell);
