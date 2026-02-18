import { FC, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, Card, IconPen, Table } from 'hds-react';
import { IconPlusCircle } from 'hds-react';
import { RootState } from '@/store';

import './styles.css';
import { IAdminMenusMenuType } from './AdminMenus.types';
import { useAppSelector } from '@/hooks/common';
import { IListState } from '@/reducers/listsSlice';
import { IListItem, ListType } from '@/interfaces/common';

interface IAdminMenusCardProps {
  menuType: IAdminMenusMenuType;
  listName: ListType;
  translateValues: boolean;
}

const AdminMenusCard: FC<IAdminMenusCardProps> = ({ menuType, listName, translateValues }) => {
  const { t } = useTranslation();

  const listOfAvailableItemsForMenuType = useAppSelector(
    (state: RootState) => state.lists[listName as keyof IListState],
  ) as Array<IListItem>;

  const availableRowsList = listOfAvailableItemsForMenuType.map((item) => {
    const value = translateValues ? t(`option.${item.value}`) : item.value;
    const rowItem = { value, id: value, edit: <IconPen /> };
    return rowItem;
  });

  const [rows, setRows] = useState(availableRowsList);

  const cols = [
    { key: 'value', headerName: t(`adminFunctions.menus.menuType.${menuType}.name`) },
    { key: 'order', headerName: t('order') },
    { key: 'edit', headerName: 'Edit' },
  ];

  const addRow = () => {
    const emptyRowItem = { value: '', id: '', edit: <IconPen /> };
    setRows([...availableRowsList, emptyRowItem]);
  };

  return (
    <Card
      heading={t(`adminFunctions.menus.menuType.${menuType}.name`)}
      data-testid={`admin-menus-card-${menuType}`}
      id={`admin-menus-card-${menuType}`}
    >
      <div className="admin-menus-card-content">
        {rows && rows.length > 0 ? (
          <Table cols={cols} rows={rows} indexKey="id" renderIndexCol={false} />
        ) : (
          <p>{t('adminFunctions.menus.tableEmptyText')}</p>
        )}
      </div>
      <Button
        variant={ButtonVariant.Secondary}
        role="link"
        onClick={addRow}
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
