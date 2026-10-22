import { FC } from 'react';
import { IconPen, IconTrash } from 'hds-react';
import { FinancingRowValues } from '@/interfaces/constructionHandoverInterfaces';

interface EditCellProps {
  onEditRow: (id: string, values?: FinancingRowValues) => void;
  id: string;
  values?: FinancingRowValues;
  disabled?: boolean;
}

const EditCell: FC<EditCellProps> = ({ onEditRow, id, values, disabled }) => {
  const iconColor = disabled ? 'var(--color-black-50)' : 'var(--color-bus)';

  return (
    <button
      type="button"
      onClick={() => onEditRow(id, values)}
      data-testid={`financing-row-edit-button-id-${id}`}
      disabled={disabled}
    >
      <IconPen color={iconColor} />
    </button>
  );
};

interface DeleteCellProps {
  onDeleteRow: (id: string) => void;
  id: string;
  disabled?: boolean;
}

const DeleteCell: FC<DeleteCellProps> = ({ onDeleteRow, id, disabled }) => {
  const iconColor = disabled ? 'var(--color-black-50)' : 'var(--color-brick)';

  return (
    <button
      type="button"
      onClick={() => onDeleteRow(id)}
      data-testid={`financing-row-delete-button-id-${id}`}
      disabled={disabled}
    >
      <IconTrash color={iconColor} />
    </button>
  );
};

export { DeleteCell, EditCell };
