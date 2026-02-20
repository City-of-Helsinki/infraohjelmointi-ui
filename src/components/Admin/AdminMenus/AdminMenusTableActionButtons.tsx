import { FC } from 'react';
import { IAdminMenusMenuType } from './AdminMenus.types';
import { IconArrowDown, IconArrowUp, IconPen } from 'hds-react';

interface IAdminMenuOrderCellProps {
  rowIndex: number;
  menuType: IAdminMenusMenuType;
  rowLength: number;
}

const OrderCell: FC<IAdminMenuOrderCellProps> = ({ rowIndex, menuType, rowLength }) => {
  const isFirstRow = rowIndex === 0;
  const isLastRow = rowIndex === rowLength - 1;

  const changeRowOrder = (rowIndex: number, change: 1 | -1) => {
    console.log(change, rowIndex);
  };

  return (
    <>
      <button
        onClick={() => changeRowOrder(rowIndex, -1)}
        data-testid={`admin-menus-order-down-button-${menuType}`}
        disabled={isFirstRow}
      >
        <IconArrowDown color={isFirstRow ? 'var(--color-black-60)' : 'var(--color-bus)'} />
      </button>
      <button
        onClick={() => changeRowOrder(rowIndex, 1)}
        data-testid={`admin-menus-order-up-button-${menuType}`}
        disabled={isLastRow}
      >
        <IconArrowUp color={isLastRow ? 'var(--color-black-60)' : 'var(--color-bus)'} />
      </button>
    </>
  );
};

interface IAdminMenuEditCellProps {
  onEditMenuItem: (menuType: string, value: string, rowIndex: number) => void;
  menuType: IAdminMenusMenuType;
  value: string;
  rowIndex: number;
}

const EditCell: FC<IAdminMenuEditCellProps> = ({ menuType, onEditMenuItem, value, rowIndex }) => {
  return (
    <button
      onClick={() => onEditMenuItem(menuType, value, rowIndex)}
      data-testid={`admin-menus-edit-button-${menuType}`}
    >
      <IconPen />
    </button>
  );
};

export { EditCell, OrderCell };
