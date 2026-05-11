import { FormSectionTitle } from '@/components/shared';
import { Button, ButtonVariant, IconPlus, Table } from 'hds-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FinancingDialog from './FinancingDialog';
import {
  FinancingDialogState,
  FinancingRowValues,
} from '@/interfaces/constructionHandoverInterfaces';
import { DeleteCell, EditCell } from './FinancingTableActionButtons';

const FinancingSection = () => {
  const { t } = useTranslation();

  const [dialogState, setDialogState] = useState<FinancingDialogState>({
    open: false,
    mode: 'add',
    values: undefined,
    itemId: '',
  });

  const handleEdit = (itemId: string, values?: FinancingRowValues) => {
    setDialogState({
      open: true,
      mode: 'edit',
      values,
      itemId,
    });
  };

  const handleDelete = (itemId: string, values?: FinancingRowValues) => {
    setDialogState({
      open: true,
      mode: 'delete',
      values,
      itemId,
    });
  };

  const addFinancingRow = () => {
    setDialogState({
      open: true,
      mode: 'add',
      values: undefined,
      itemId: '',
    });
  };

  const handleClose = () => {
    setDialogState({
      mode: 'add',
      open: false,
      values: undefined,
      itemId: '',
    });
  };

  const listOfAvailableItemsForListType: FinancingRowValues[] = [
    {
      budget: '1000',
      projectNumber: '1234',
      budgetItem: 'testi',
      id: '1',
      financer: 'Helsingin kaupunki',
    },
  ]; // NOTE: Placeholder, will be replaced with actual data from backend
  const availableRowsList = listOfAvailableItemsForListType.map((item) => {
    const rowItem = {
      budget: item.budget,
      projectNumber: item.projectNumber,
      budgetItem: item.budgetItem,
      id: item.id,
      editCell: <EditCell onEditRow={handleEdit} id={item.id} values={item} />,
      deleteCell: <DeleteCell onDeleteRow={handleDelete} id={item.id} />,
    };
    return rowItem;
  });

  const cols = [
    {
      key: 'budgetItem',
      headerName: t(`constructionHandoverForm.financingSection.label.budgetItem`),
    },
    {
      key: 'projectNumber',
      headerName: t(`constructionHandoverForm.financingSection.label.projectNumber`),
    },
    { key: 'budget', headerName: t(`constructionHandoverForm.financingSection.label.budget`) },
    { key: 'editCell', headerName: t('edit') },
    { key: 'deleteCell', headerName: t('delete') },
  ];

  return (
    <div className="mb-12">
      <FormSectionTitle
        label="constructionHandoverForm.financingSection.title"
        name="constructionHandoverFinancing"
      />
      <div>
        {availableRowsList && availableRowsList.length > 0 ? (
          <Table cols={cols} rows={availableRowsList} indexKey="id" renderIndexCol={false} />
        ) : (
          <p>{t('constructionHandoverForm.financingSection.tableEmptyText')}</p>
        )}
        <Button
          variant={ButtonVariant.Secondary}
          onClick={addFinancingRow}
          data-testid={'addFinancing-button'}
          iconStart={<IconPlus />}
        >
          {t('constructionHandoverForm.financingSection.addRow')}
        </Button>
        <FinancingDialog dialogState={dialogState} handleClose={handleClose} />
      </div>
    </div>
  );
};

export default memo(FinancingSection);
