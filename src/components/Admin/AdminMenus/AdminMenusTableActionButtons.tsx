import { FC } from 'react';
import { IconArrowDown, IconArrowUp, IconPen } from 'hds-react';
import { IAdminMenuOrderCellProps } from '@/interfaces/menuItemsInterfaces';
import { moveRow, saveTableOrderThunk } from '@/reducers/listsSlice';
import { useAppDispatch } from '@/hooks/common';

const OrderCell: FC<IAdminMenuOrderCellProps> = ({ rowIndex, path, listType, rowLength, id }) => {
  const dispatch = useAppDispatch();
  const isFirstRow = rowIndex === 0;
  const isLastRow = rowIndex === rowLength - 1;

  const moveAndSave = (rowId: string, direction: 'up' | 'down') => {
    dispatch(moveRow({ listType, rowId, direction }));
    dispatch(saveTableOrderThunk({ listType, path }));
  };

  return (
    <>
      <button
        onClick={() => moveAndSave(id, 'down')}
        data-testid={`admin-menus-order-down-button-id-${id}`}
        disabled={isFirstRow}
      >
        <IconArrowDown color={isFirstRow ? 'var(--color-black-60)' : 'var(--color-bus)'} />
      </button>
      <button
        onClick={() => moveAndSave(id, 'up')}
        data-testid={`admin-menus-order-up-button-id-${id}`}
        disabled={isLastRow}
      >
        <IconArrowUp color={isLastRow ? 'var(--color-black-60)' : 'var(--color-bus)'} />
      </button>
    </>
  );
};

interface IAdminMenuEditCellProps {
  onEditMenuItem: (value: string, rowIndex: number, id: string, path: string) => void;
  value: string;
  rowIndex: number;
  path: string;
  id: string;
}

const EditCell: FC<IAdminMenuEditCellProps> = ({ onEditMenuItem, value, rowIndex, id, path }) => {
  return (
    <button
      onClick={() => onEditMenuItem(value, rowIndex, id, path)}
      data-testid={`admin-menus-edit-button-id-${id}`}
    >
      <IconPen />
    </button>
  );
};

export { EditCell, OrderCell };
