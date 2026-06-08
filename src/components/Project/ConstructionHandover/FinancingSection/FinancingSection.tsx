import { FormSectionTitle, TextField } from '@/components/shared';
import { Button, ButtonVariant, IconPlus, Table } from 'hds-react';
import { memo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FinancingDialog from './FinancingDialog';
import {
  FinancingDialogState,
  FinancingRowValues,
} from '@/interfaces/constructionHandoverInterfaces';
import { DialogMode } from '@/interfaces/menuItemsInterfaces';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { DeleteCell, EditCell } from './FinancingTableActionButtons';
import { getFieldProps } from '../ConstructionHandoverForm';
import { validateRequired } from '@/utils/validation';

const formatBudgetEuro = (value: string): string => {
  const numericValue = Number(
    value
      .replace(/\s/g, '')
      .replace('€', '')
      .replace(',', '.'),
  );

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  const [integerPart, decimalPart] = numericValue.toFixed(2).split('.');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${groupedInteger},${decimalPart}€`;
};

const FinancingSection = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<IConstructionHandoverForm>();
  const { fields, append, update, remove } = useFieldArray<
    IConstructionHandoverForm,
    'constructionHandoverFinancing',
    'formId'
  >({
    control,
    name: 'constructionHandoverFinancing',
    keyName: 'formId',
  });

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

  const onRowSaved = (row: FinancingRowValues, mode: DialogMode) => {
    if (mode === 'edit') {
      const index = fields.findIndex((item) => item.id === row.id);
      if (index >= 0) {
        update(index, row);
        return;
      }
    }

    append(row);
  };

  const onRowDeleted = (id: string) => {
    const index = fields.findIndex((item) => item.id === id);
    if (index >= 0) {
      remove(index);
    }
  };

  const availableRowsList = fields.map((item) => ({
    description: item.description ?? '',
    budget: formatBudgetEuro(item.budget),
    projectNumber: item.projectNumber,
    budgetItem: item.budgetItem,
    id: item.id,
    formId: item.formId,
    editCell: <EditCell onEditRow={handleEdit} id={item.id} values={item} />,
    deleteCell: <DeleteCell onDeleteRow={handleDelete} id={item.id} />,
  }));

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
        {availableRowsList.length > 0 ? (
          <Table cols={cols} rows={availableRowsList} indexKey="formId" renderIndexCol={false} />
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
        <TextField
          required
          {...getFieldProps('totalCost')}
          rules={{ ...validateRequired('totalCost', t) }}
        />
        <FinancingDialog
          dialogState={dialogState}
          handleClose={handleClose}
          onRowSaved={onRowSaved}
          onRowDeleted={onRowDeleted}
        />
      </div>
    </div>
  );
};

export default memo(FinancingSection);
