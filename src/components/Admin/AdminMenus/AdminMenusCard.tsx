import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, Card, Table } from 'hds-react';
import { IconPlusCircle } from 'hds-react';
import { RootState } from '@/store';

import './styles.css';
import { IAdminMenusMenuType } from './AdminMenus.types';
import { useAppSelector } from '@/hooks/common';
import { IListState } from '@/reducers/listsSlice';
import { IListItem, ListType } from '@/interfaces/common';
import { EditCell, OrderCell } from './AdminMenusTableActionButtons';

interface IAdminMenusCardProps {
  menuType: IAdminMenusMenuType;
  listName: ListType;
  translateValues: boolean;
  onEditMenuItem: (menuType: string, value: string, rowIndex: number) => void;
  onAddMenuItem: (tableType: string) => void;
}

const AdminMenusCard: FC<IAdminMenusCardProps> = ({
  menuType,
  listName,
  translateValues,
  onEditMenuItem,
  onAddMenuItem,
}) => {
  const { t } = useTranslation();

  const listOfAvailableItemsForMenuType = useAppSelector(
    (state: RootState) => state.lists[listName as keyof IListState],
  ) as Array<IListItem>;

  const availableRowsList = listOfAvailableItemsForMenuType.map((item, index) => {
    const value = translateValues ? t(`option.${item.value}`) : item.value;
    const rowItem = {
      value,
      id: value,
      order: (
        <OrderCell
          rowIndex={index}
          menuType={menuType}
          rowLength={listOfAvailableItemsForMenuType.length}
        />
      ),
      edit: (
        <EditCell
          menuType={menuType}
          onEditMenuItem={onEditMenuItem}
          value={value}
          rowIndex={index}
        />
      ),
      rowIndex: index,
    };
    return rowItem;
  });

  const cols = [
    { key: 'value', headerName: t(`adminFunctions.menus.menuType.${menuType}`) },
    { key: 'order', headerName: t('order') },
    { key: 'edit', headerName: 'Edit' },
  ];

  return (
    <Card
      heading={t(`adminFunctions.menus.menuType.${menuType}`)}
      data-testid={`admin-menus-card-${menuType}`}
      id={`menu-card-${menuType}`}
      className="admin-menus-card"
    >
      <div className="admin-menus-card-content">
        {availableRowsList && availableRowsList.length > 0 ? (
          <Table
            cols={cols}
            rows={availableRowsList}
            indexKey="id"
            renderIndexCol={false}
            initialSortingColumnKey={'index'}
            initialSortingOrder="asc"
          />
        ) : (
          <p>{t('adminFunctions.menus.tableEmptyText')}</p>
        )}
      </div>
      <Button
        variant={ButtonVariant.Secondary}
        role="link"
        onClick={() => onAddMenuItem(menuType)}
        data-testid={`admin-menus-card-button-${menuType}`}
        iconStart={
          <IconPlusCircle aria-label={t('adminFunctions.addRowButton')} aria-hidden={false} />
        }
      >
        {t('adminFunctions.menus.addRowButton')}
      </Button>
    </Card>
  );
};

export default memo(AdminMenusCard);
