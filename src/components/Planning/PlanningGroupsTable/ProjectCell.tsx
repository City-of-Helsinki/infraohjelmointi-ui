import { useAppDispatch } from '@/hooks/common';
import { IProjectRequestObject } from '@/interfaces/projectInterfaces';
import { patchProjectThunk, silentPatchProjectThunk } from '@/reducers/projectSlice';
import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useState } from 'react';

export interface IProjectCellProps {
  value: string;
  isPlanning: boolean;
  isConstruction: boolean;
  objectKey: string;
  id: string;
}

const PlanningGroupsTableCell: FC<IProjectCellProps> = ({
  value,
  isPlanning,
  isConstruction,
  objectKey,
  id,
}) => {
  const dispatch = useAppDispatch();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState<'' | number>(parseInt(value));

  const handleFocus = () => setIsReadOnly(!isReadOnly);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setFormValue(parseInt(e.target.value));
  const handleBlur = () => {
    const data = { [objectKey]: formValue };
    setIsReadOnly(!isReadOnly);
    dispatch(silentPatchProjectThunk({ id, data }));
  };

  const getColorClass = () => {
    if (isPlanning && isConstruction) {
      return 'planningAndConstruction';
    }
    if (isPlanning) {
      return 'planning';
    }
    if (isConstruction) {
      return 'construction';
    }
    return '';
  };

  return (
    <td className={`project-cell ${getColorClass()}`}>
      <div>
        <NumberInput
          value={isPlanning || isConstruction ? formValue : ''}
          id={`${objectKey}-${id}`}
          label=""
          className="table-input"
          readOnly={isReadOnly}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChange={handleChange}
          disabled={!(isPlanning || isConstruction)}
        />
      </div>
    </td>
  );
};

export default PlanningGroupsTableCell;
