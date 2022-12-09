import { NumberInput } from 'hds-react/components/NumberInput';
import { ChangeEvent, FC, useState } from 'react';

/**
 * RED CELLS
 * background: 'var(--color-white)'
 * borderBottom: '4px solid var(--color-suomenlinna)'
 *
 * GREEN CELLS
 * background: 'var(--color-white)'
 * borderBottom: '4px solid var(--color-copper)'
 *
 * BLACK CELLS
 * background: 'var(--color-white)'
 * borderBottom: '4px solid var(--color-black-80)'
 */

interface IPlanningListProjectsTableCellProps {
  value: number;
}

const PlanningListProjectsTableCell: FC<IPlanningListProjectsTableCellProps> = ({ value }) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [formValue, setFormValue] = useState(value);

  const handleFocus = () => setIsReadOnly(!isReadOnly);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setFormValue(Number(e.target.value));
  const handleBlur = () => {
    setIsReadOnly(!isReadOnly);
    // TODO: save field value for selected project
  };

  return (
    <td
      className="project-cell"
      style={{
        background: formValue ? 'var(--color-white)' : 'var(--color-bus-light)',
        borderBottom: formValue
          ? '0.2rem solid var(--color-copper)'
          : '0.2rem solid var(--color-bus-light)',
      }}
    >
      <NumberInput
        value={formValue || ''}
        id="pc-sum"
        label=""
        className="table-input"
        readOnly={isReadOnly}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onChange={handleChange}
      />
    </td>
  );
};

export default PlanningListProjectsTableCell;
