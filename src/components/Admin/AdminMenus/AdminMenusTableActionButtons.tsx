import { FC, useCallback } from 'react';
import { IconArrowDown, IconArrowUp, IconPen } from 'hds-react';
import { IAdminMenuOrderCellProps, ReorderableListType } from '@/interfaces/menuItemsInterfaces';
import { moveRow, saveTableOrderThunk } from '@/reducers/listsSlice';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useTranslation } from 'react-i18next';

const OrderCell: FC<IAdminMenuOrderCellProps> = ({ rowIndex, path, listType, rowLength, id }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFirstRow = rowIndex === 0;
  const isLastRow = rowIndex === rowLength - 1;

  const onMoveAndSaveRow = useCallback(
    async (rowId: string, direction: 'up' | 'down') => {
      try {
        dispatch(moveRow({ listType, rowId, direction }));
        await dispatch(saveTableOrderThunk({ listType, path })).unwrap();

        dispatch(
          notifySuccess({
            message: t('reorderSuccess'),
            title: t('reorderSuccess'),
            type: 'toast',
            duration: 1500,
          }),
        );
      } catch {
        dispatch(
          notifyError({
            message: t('reorderError'),
            title: t('reorderError'),
            type: 'toast',
            duration: 1500,
          }),
        );
      }
    },
    [dispatch, listType, path, t],
  );

  return (
    <>
      <button
        onClick={() => onMoveAndSaveRow(id, 'down')}
        data-testid={`admin-menus-order-down-button-id-${id}`}
        disabled={isLastRow}
      >
        <IconArrowDown color={isLastRow ? 'var(--color-black-60)' : 'var(--color-bus)'} />
      </button>
      <button
        onClick={() => onMoveAndSaveRow(id, 'up')}
        data-testid={`admin-menus-order-up-button-id-${id}`}
        disabled={isFirstRow}
      >
        <IconArrowUp color={isFirstRow ? 'var(--color-black-60)' : 'var(--color-bus)'} />
      </button>
    </>
  );
};

interface IAdminMenuEditCellProps {
  onEditMenuItem: (value: string, id: string, path: string, listType: ReorderableListType) => void;
  value: string;
  path: string;
  id: string;
  listType: ReorderableListType;
}

const EditCell: FC<IAdminMenuEditCellProps> = ({ onEditMenuItem, value, id, path, listType }) => {
  return (
    <button
      onClick={() => onEditMenuItem(value, id, path, listType)}
      data-testid={`admin-menus-edit-button-id-${id}`}
    >
      <IconPen />
    </button>
  );
};

export { EditCell, OrderCell };
