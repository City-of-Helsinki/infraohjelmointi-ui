import { FC } from 'react';
import { IconPen, IconTrash } from 'hds-react';
import { FinancingRowValues } from '@/interfaces/constructionHandoverInterfaces';

interface EditCellProps {
  onEditRow: (id: string, values?: FinancingRowValues) => void;
  id: string;
  values?: FinancingRowValues;
}

const EditCell: FC<EditCellProps> = ({ onEditRow, id, values }) => {
  return (
    <button
      type="button"
      onClick={() => onEditRow(id, values)}
      data-testid={`financing-row-edit-button-id-${id}`}
    >
      <IconPen color="var(--color-bus)" />
    </button>
  );
};

interface DeleteCellProps {
  onDeleteRow: (id: string) => void;
  id: string;
}

const DeleteCell: FC<DeleteCellProps> = ({ onDeleteRow, id }) => {
  return (
    <button
      type="button"
      onClick={() => onDeleteRow(id)}
      data-testid={`financing-row-delete-button-id-${id}`}
    >
      <IconTrash color="var(--color-brick)" />
    </button>
  );
};

export { DeleteCell, EditCell };
