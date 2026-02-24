import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, Card, Table } from 'hds-react';
import { IconPlusCircle } from 'hds-react';
import { RootState } from '@/store';

import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { IListState } from '@/reducers/listsSlice';
import { IListItem } from '@/interfaces/common';
import { EditCell, OrderCell } from './AdminMenusTableActionButtons';
import { AdminMenusCardProps } from '@/interfaces/menuItemsInterfaces';

const AdminMenusCard: FC<AdminMenusCardProps> = ({
  path,
  listType,
  translateValues,
  onEditMenuItem,
  onAddMenuItem,
}) => {
  const { t } = useTranslation();

  const listOfAvailableItemsForListType = useAppSelector(
    (state: RootState) => state.lists[listType as keyof IListState],
  ) as Array<IListItem>;

  const availableRowsList = listOfAvailableItemsForListType.map((item, index) => {
    const value = translateValues
      ? t(`option.${item.value}`, { defaultValue: item.value })
      : item.value;
    const rowItem = {
      value,
      id: item.id,
      orderCell: (
        <OrderCell
          rowIndex={index}
          listType={listType}
          rowLength={listOfAvailableItemsForListType.length}
          id={item.id}
          path={path}
        />
      ),
      editCell: <EditCell onEditMenuItem={onEditMenuItem} value={value} path={path} id={item.id} />,
      order: item.order,
    };
    return rowItem;
  });

  const cols = [
    { key: 'value', headerName: t(`adminFunctions.menus.listType.${listType}`) },
    { key: 'orderCell', headerName: t('order') },
    { key: 'editCell', headerName: t('edit') },
  ];

  return (
    <Card
      heading={t(`adminFunctions.menus.listType.${listType}`)}
      data-testid={`admin-menus-card-${listType}`}
      id={`menu-card-${listType}`}
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
        onClick={() => onAddMenuItem(path)}
        data-testid={`admin-menus-card-button-${listType}`}
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
