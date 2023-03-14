import { useAppDispatch } from '@/hooks/common';
import { CellType, ContextMenuType } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { dispatchContextMenuEvent } from '@/utils/events';
import { IconAngleLeft } from 'hds-react/icons';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useCallback, useState, MouseEvent, useEffect, memo } from 'react';
import { removeYear } from '@/utils/dates';

export interface IProjectCellProps {
  value: string;
  type: CellType;
  objectKey: string;
  project: IProject;
  year: number;
}

const ProjectCell: FC<IProjectCellProps> = ({ value, type, objectKey, project, year }) => {
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
    const data = { [objectKey]: formValue };
    setIsReadOnly(!isReadOnly);
    dispatch(silentPatchProjectThunk({ id: project.id, data }));
  }, [dispatch, formValue, isReadOnly, objectKey, project.id]);

  const handleOpenContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      dispatchContextMenuEvent(e, {
        year,
        project,
        cellType: type,
        menuType: ContextMenuType.EDIT_PROJECT_CELL,
        objectKey: objectKey,
      });
    },
    [project],
  );

  const handleAddYear = useCallback(() => {
    dispatch(
      silentPatchProjectThunk({
        id: project.id,
        data: { estPlanningStart: removeYear(project.estPlanningStart) },
      }),
    );
  }, [project]);

  useEffect(() => {
    if (project[objectKey as keyof IProject] as string) {
      setFormValue(parseInt(project[objectKey as keyof IProject] as string));
    }
  }, [project]);

  return (
    <td
      className={`project-cell ${type}`}
      onContextMenu={type !== 'none' ? handleOpenContextMenu : undefined}
    >
      <NumberInput
        value={type !== 'none' ? formValue : ''}
        id={`${objectKey}-${project.id}`}
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
        disabled={type === 'none'}
      />
      <button className="edit-timeline-button" onClick={handleAddYear}>
        <IconAngleLeft />
      </button>
    </td>
  );
};

export default memo(ProjectCell);
