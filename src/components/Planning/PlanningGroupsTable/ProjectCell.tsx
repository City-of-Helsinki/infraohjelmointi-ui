import { useAppDispatch } from '@/hooks/common';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, memo, useCallback, useState } from 'react';

export type CellType = 'planning' | 'construction' | 'planningAndConstruction' | 'none';

export interface IProjectCellProps {
  value: string;
  type: CellType;
  objectKey: string;
  projectId: string;
}

const ProjectCell: FC<IProjectCellProps> = ({ value, type, objectKey, projectId }) => {
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<'' | number>(parseInt(value));

  const handleFocus = useCallback(() => {
    setIsReadOnly((current) => !current);
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValue(parseInt(e.target.value));
  }, []);

  const handleBlur = useCallback(() => {
    const data = { [objectKey]: formValue };
    setIsReadOnly(!isReadOnly);
    dispatch(silentPatchProjectThunk({ id: projectId, data }));
  }, [dispatch, formValue, isReadOnly, objectKey, projectId]);

  return (
    <td className={`project-cell ${type}`}>
      <NumberInput
        value={type !== 'none' ? formValue : ''}
        id={`${objectKey}-${projectId}`}
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
        disabled={type === 'none'}
      />
    </td>
  );
};

export default memo(ProjectCell);
