import { FormSectionTitle, TextField } from '@/components/shared';
import { Button, ButtonVariant, IconPlus, Table } from 'hds-react';
import { IconAngleDown, IconAngleUp } from 'hds-react/icons';
import { memo, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FinancingDialogState,
  FinancingRowValues,
} from '@/interfaces/constructionHandoverInterfaces';
import { DialogMode } from '@/interfaces/menuItemsInterfaces';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { DeleteCell, EditCell } from './FinancingTableActionButtons';
import { getFieldProps } from '../ConstructionHandoverForm';
import { useOptions } from '@/hooks/useOptions';
import FinancingDialog from './FinancingDialog';

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
  const financingPartyOptions = useOptions('financingParties');
  const projectTypeQualifierOptions = useOptions('typeQualifiers');
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
  const [expandedMainRows, setExpandedMainRows] = useState<Record<string, boolean>>({});

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

  const getFinancingPartyLabel = (code: string) =>
    financingPartyOptions.find((option) => option.value === code)?.label ?? code;

  const getBudgetItemLabel = (id: string) =>
    t(
      `option.${projectTypeQualifierOptions.find((option) => option.value === id)?.label ?? ''}`,
      {
        defaultValue: projectTypeQualifierOptions.find((option) => option.value === id)?.label ?? id,
      },
    );

  const groupedRows = useMemo(() => {
    const kympRows = fields.filter((item) => item.financer === 'KYMP');
    const nonKympRows = fields.filter((item) => item.financer !== 'KYMP');

    const rows: Array<{
      key: string;
      isMainRow: boolean;
      isSubRow: boolean;
      hasSubRows: boolean;
      item?: FinancingRowValues;
      mainRowKey: string;
      budgetItemText: string;
      projectNumber: string;
      budget: string;
      showActions: boolean;
    }> = [];

    if (kympRows.length > 1) {
      const mainRowKey = 'KYMP-main';
      rows.push({
        key: mainRowKey,
        isMainRow: true,
        isSubRow: false,
        hasSubRows: true,
        mainRowKey,
        budgetItemText: getFinancingPartyLabel('KYMP'),
        projectNumber: '',
        budget: '',
        showActions: false,
      });

      if (expandedMainRows[mainRowKey] ?? false) {
        kympRows.forEach((item) => {
          rows.push({
            key: item.formId,
            isMainRow: false,
            isSubRow: true,
            hasSubRows: false,
            item,
            mainRowKey,
            budgetItemText: getBudgetItemLabel(item.budgetItem),
            projectNumber: item.projectNumber,
            budget: formatBudgetEuro(item.budget),
            showActions: true,
          });
        });
      }
    } else if (kympRows.length === 1) {
      const item = kympRows[0];
      rows.push({
        key: item.formId,
        isMainRow: true,
        isSubRow: false,
        hasSubRows: false,
        item,
        mainRowKey: item.formId,
        budgetItemText: getFinancingPartyLabel(item.financer),
        projectNumber: item.projectNumber,
        budget: formatBudgetEuro(item.budget),
        showActions: true,
      });
    }

    nonKympRows.forEach((item) => {
      rows.push({
        key: item.formId,
        isMainRow: true,
        isSubRow: false,
        hasSubRows: false,
        item,
        mainRowKey: item.formId,
        budgetItemText: getFinancingPartyLabel(item.financer),
        projectNumber: item.projectNumber,
        budget: formatBudgetEuro(item.budget),
        showActions: true,
      });
    });

    return rows;
  }, [expandedMainRows, fields, financingPartyOptions, projectTypeQualifierOptions, t]);

  const tableRows = groupedRows.map((row) => ({
    id: row.key,
    budgetItem: row.hasSubRows ? (
      <button
        type="button"
        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={() =>
          setExpandedMainRows((prev) => ({
            ...prev,
            [row.mainRowKey]: !(prev[row.mainRowKey] ?? false),
          }))
        }
      >
        {expandedMainRows[row.mainRowKey] ? <IconAngleUp /> : <IconAngleDown />}
        <span>{row.budgetItemText}</span>
      </button>
    ) : (
      row.budgetItemText
    ),
    projectNumber: row.projectNumber,
    budget: <span style={{ whiteSpace: 'nowrap' }}>{row.budget}</span>,
    editCell:
      row.showActions && row.item ? (
        <EditCell onEditRow={handleEdit} id={row.item.id} values={row.item} />
      ) : null,
    deleteCell:
      row.showActions && row.item ? <DeleteCell onDeleteRow={handleDelete} id={row.item.id} /> : null,
  }));

  const cols = [
    {
      key: 'budgetItem',
      headerName: t('constructionHandoverForm.financingSection.label.budgetItem'),
    },
    {
      key: 'projectNumber',
      headerName: t('constructionHandoverForm.financingSection.label.projectNumber'),
    },
    {
      key: 'budget',
      headerName: t('constructionHandoverForm.financingSection.label.budget'),
    },
    { key: 'editCell', headerName: t('edit') },
    { key: 'deleteCell', headerName: t('delete') },
  ];

  return (
    <div className="mb-12">
      <FormSectionTitle
        label="constructionHandoverForm.financingSection.title"
        name="constructionHandoverFinancing"
      />
      <div className="input-wrapper">
        {tableRows.length > 0 ? (
          <Table cols={cols} rows={tableRows} indexKey="id" renderIndexCol={false} />
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
      </div>
      <TextField {...getFieldProps('totalCost')} />
      <FinancingDialog
        dialogState={dialogState}
        handleClose={handleClose}
        onRowSaved={onRowSaved}
        onRowDeleted={onRowDeleted}
      />
    </div>
  );
};

export default memo(FinancingSection);
