import { useAppDispatch } from '@/hooks/common';
import {
  FinancingDialogState,
  FinancingRowRequest,
  FinancingRowValues,
} from '@/interfaces/constructionHandoverInterfaces';
import { DialogMode } from '@/interfaces/menuItemsInterfaces';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useOptions } from '@/hooks/useOptions';
import useGetProject from '@/hooks/useGetProject';
import axios from 'axios';
import { Button, ButtonVariant, Dialog, Select as HDSSelect, TextInput } from 'hds-react';
import { TFunction } from 'i18next';
import { ChangeEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { REACT_APP_API_URL } = process.env;

export const postFinancingRow = async (request: FinancingRowRequest) => {
  const res = await axios.post(`${REACT_APP_API_URL}/construction-handover-financings/`, request);
  return res.data;
};

export const patchFinancingRow = async (request: FinancingRowRequest, itemId: string) => {
  const res = await axios.patch(
    `${REACT_APP_API_URL}/construction-handover-financings/${itemId}/`,
    request,
  );
  return res.data;
};

export const deleteFinancingRow = async (itemId: string) => {
  await axios.delete(`${REACT_APP_API_URL}/construction-handover-financings/${itemId}/`);
};

interface FinancingDialogProps {
  dialogState: FinancingDialogState;
  handleClose: () => void;
  onRowSaved: (row: FinancingRowValues, mode: DialogMode) => void;
  onRowDeleted: (id: string) => void;
}

const getFieldError = (
  t: TFunction<'translation'>,
  submitAttempted: boolean,
  value: string | undefined,
) => {
  if (!submitAttempted) return undefined;
  if (value) return undefined;
  return t('constructionHandoverForm.financingSection.requiredField');
};

const emptyDialogValues: FinancingRowValues = {
  financer: '',
  description: '',
  budgetItem: '',
  projectNumber: '',
  budget: '',
  id: '',
};

const normalizeSavedRow = (
  saved: unknown,
  fallbackValues: FinancingRowValues,
): FinancingRowValues => {
  if (!saved || typeof saved !== 'object') {
    return fallbackValues;
  }

  const row = saved as Record<string, unknown>;
  const budgetItem = row.budgetItem as Record<string, unknown> | undefined;

  return {
    financer: String(row.financingParty ?? fallbackValues.financer ?? ''),
    description: String(row.description ?? fallbackValues.description ?? ''),
    budgetItem: String(budgetItem?.id ?? fallbackValues.budgetItem ?? ''),
    projectNumber: String(row.projectNumber ?? fallbackValues.projectNumber ?? ''),
    budget: String(row.budget ?? fallbackValues.budget ?? ''),
    id: String(row.id ?? fallbackValues.id ?? ''),
  };
};

const AddOrEditRowDialog: FC<FinancingDialogProps> = ({ handleClose, dialogState, onRowSaved }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: project } = useGetProject();
  const financingPartyOptions = useOptions('financingParties');
  const budgetItemOptions = useOptions('typeQualifiers').map((option) => ({
    ...option,
    label: t(`option.${option.label}`, { defaultValue: option.label }),
  }));
  const { Header, Content, ActionButtons } = Dialog;
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [dialogValues, setDialogValues] = useState<FinancingRowValues>(emptyDialogValues);

  useEffect(() => {
    setDialogValues({
      financer: dialogState.values?.financer ?? '',
      description: dialogState.values?.description ?? '',
      budgetItem: dialogState.values?.budgetItem ?? '',
      projectNumber: dialogState.values?.projectNumber ?? '',
      budget: dialogState.values?.budget ?? '',
      id: dialogState.values?.id ?? '',
    });
  }, [dialogState]);

  const isOtherFinancingSelected = dialogValues.financer === 'OTHER';
  const isDescriptionRequired = isOtherFinancingSelected;

  const onSetMenuItemName = useCallback(
    (value: keyof FinancingRowValues, e: ChangeEvent<HTMLInputElement>) =>
      setDialogValues((prev) => ({
        ...prev,
        [value]: e.target.value,
      })),
    [],
  );

  const onSaveChange = useCallback(async () => {
    setSubmitAttempted(true);
    if (
      !dialogValues.financer ||
      !dialogValues.budgetItem ||
      !dialogValues.projectNumber ||
      !dialogValues.budget ||
      (isDescriptionRequired && !dialogValues.description)
    ) {
      return;
    }

    const request: FinancingRowRequest = {
      financingParty: dialogValues.financer,
      description: dialogValues.description,
      budgetItemId: dialogValues.budgetItem,
      projectNumber: dialogValues.projectNumber,
      budget: dialogValues.budget,
      project: project?.id,
    };

    try {
      const savedRow =
        dialogState.mode === 'edit' && dialogValues.id
          ? await patchFinancingRow(request, dialogValues.id)
          : await postFinancingRow(request);

      onRowSaved(
        normalizeSavedRow(savedRow, {
          financer: dialogValues.financer,
          description: dialogValues.description,
          budgetItem: dialogValues.budgetItem,
          projectNumber: dialogValues.projectNumber,
          budget: dialogValues.budget,
          id: dialogValues.id,
        }),
        dialogState.mode,
      );

      setDialogValues(emptyDialogValues);
      setSubmitAttempted(false);
      handleClose();

      dispatch(
        notifySuccess({
          message: t('constructionHandoverForm.financingSection.submitSuccessMessage'),
          title: t('constructionHandoverForm.financingSection.submitSuccessTitle'),
          type: 'toast',
          duration: 1500,
        }),
      );
    } catch {
      dispatch(
        notifyError({
          message: t('constructionHandoverForm.financingSection.submitError'),
          title: t('constructionHandoverForm.financingSection.submitError'),
          type: 'toast',
          duration: 1500,
        }),
      );
    }
  }, [
    dialogValues,
    dialogState.mode,
    dispatch,
    handleClose,
    isDescriptionRequired,
    onRowSaved,
    project?.id,
    t,
  ]);

  return (
    <Dialog
      isOpen={dialogState.open}
      close={handleClose}
      id={`${dialogState.mode}-financing-row-dialog`}
      aria-labelledby={`${dialogState.mode}-financing-row-dialog-title`}
      aria-describedby={`${dialogState.mode}-financing-row-dialog-title`}
      closeButtonLabelText={t('constructionHandoverForm.financingSection.closeDialogButton')}
    >
      <Header
        id={`${dialogState.mode}-financing-row-dialog-title`}
        title={t(`constructionHandoverForm.financingSection.${dialogState.mode}DialogTitle`)}
      />
      <Content>
        <div data-testid="financing-dialog-financer-input">
          <HDSSelect
            id="financing-dialog-financer-select"
            options={financingPartyOptions}
            value={
              dialogValues.financer
                ? financingPartyOptions.filter((option) => option.value === dialogValues.financer)
                : []
            }
            onChange={(_, clickedOption) => {
              const selectedFinancingParty = clickedOption?.value ?? '';

              setDialogValues((prev) => ({
                ...prev,
                financer: selectedFinancingParty,
                ...(selectedFinancingParty === 'KYMP'
                  ? {
                      description: '',
                      budgetItem: project?.typeQualifier?.id ?? '',
                      projectNumber: project?.sapProject ?? '',
                      budget: project?.budget ?? '',
                    }
                  : {
                      description: selectedFinancingParty === 'OTHER' ? prev.description ?? '' : '',
                      budgetItem: '',
                      projectNumber: '',
                      budget: '',
                    }),
              }));
            }}
            invalid={
              getFieldError(t, submitAttempted, dialogValues.financer) !== undefined
            }
            required
            texts={{
              label: t('constructionHandoverForm.financingSection.label.financer'),
              error: getFieldError(t, submitAttempted, dialogValues.financer),
              placeholder: t('choose'),
            }}
          />
        </div>
        <div data-testid="financing-dialog-budget-item-select">
          <HDSSelect
            id="financing-dialog-budget-item-select"
            options={budgetItemOptions}
            value={
              dialogValues.budgetItem
                ? budgetItemOptions.filter((option) => option.value === dialogValues.budgetItem)
                : []
            }
            onChange={(_, clickedOption) => {
              setDialogValues((prev) => ({
                ...prev,
                budgetItem: clickedOption?.value ?? '',
              }));
            }}
            invalid={
              getFieldError(t, submitAttempted, dialogValues.budgetItem) !== undefined
            }
            required
            texts={{
              label: t('constructionHandoverForm.financingSection.label.budgetItem'),
              error: getFieldError(t, submitAttempted, dialogValues.budgetItem),
              placeholder: t('choose'),
            }}
          />
        </div>
        <TextInput
          id="financing-dialog-project-number-input"
          label={t('constructionHandoverForm.financingSection.label.projectNumber')}
          value={dialogValues.projectNumber}
          onChange={(e) => onSetMenuItemName('projectNumber', e)}
          data-testid="financing-dialog-project-number-input"
          errorText={getFieldError(t, submitAttempted, dialogValues.projectNumber)}
          invalid={
            getFieldError(t, submitAttempted, dialogValues.projectNumber) !== undefined
          }
          required
        />
        <TextInput
          id="financing-dialog-budget-input"
          label={t('constructionHandoverForm.financingSection.label.budget')}
          value={dialogValues.budget}
          onChange={(e) => onSetMenuItemName('budget', e)}
          data-testid="financing-dialog-budget-input"
          errorText={getFieldError(t, submitAttempted, dialogValues.budget)}
          invalid={getFieldError(t, submitAttempted, dialogValues.budget) !== undefined}
          required
        />
        {isDescriptionRequired && (
          <TextInput
            id="financing-dialog-description-input"
            label={t('constructionHandoverForm.description')}
            value={dialogValues.description ?? ''}
            onChange={(e) => onSetMenuItemName('description', e)}
            data-testid="financing-dialog-description-input"
            errorText={getFieldError(t, submitAttempted, dialogValues.description)}
            invalid={getFieldError(t, submitAttempted, dialogValues.description) !== undefined}
            required
          />
        )}
      </Content>
      <ActionButtons>
        <Button onClick={onSaveChange} data-testid="submit-financing-row-button">
          {t('save')}
        </Button>
        <Button
          onClick={() => {
            handleClose();
            setSubmitAttempted(false);
          }}
          variant={ButtonVariant.Secondary}
        >
          {t('cancel')}
        </Button>
      </ActionButtons>
    </Dialog>
  );
};

const DeleteRowDialog: FC<FinancingDialogProps> = ({ handleClose, dialogState, onRowDeleted }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, ActionButtons, Content } = Dialog;
  const [deletableItemId, setDeletableItemId] = useState<string>('');

  useEffect(() => {
    setDeletableItemId(dialogState.itemId);
  }, [dialogState]);

  const onDeleteRow = useCallback(async () => {
    if (!deletableItemId) return;
    try {
      await deleteFinancingRow(deletableItemId);
      onRowDeleted(deletableItemId);
      handleClose();

      dispatch(
        notifySuccess({
          message: 'rowDeleteSuccess',
          title: 'deleteSuccess',
          type: 'toast',
          duration: 1500,
        }),
      );
    } catch {
      dispatch(
        notifyError({
          message: 'rowDeleteError',
          title: 'deleteError',
          type: 'toast',
          duration: 1500,
        }),
      );
    }
  }, [deletableItemId, dispatch, handleClose, onRowDeleted]);

  return (
    <Dialog
      isOpen={dialogState.open}
      close={handleClose}
      id="delete-financing-row-dialog"
      aria-labelledby={'delete-financing-row-dialog-title'}
      aria-describedby={'delete-financing-row-dialog-description'}
      closeButtonLabelText={t('constructionHandoverForm.financingSection.closeDialogButton')}
    >
      <Header
        id="delete-financing-row-dialog-title"
        title={t('constructionHandoverForm.financingSection.deleteDialogTitle')}
      />
      <Content>
        <p id="delete-financing-row-dialog-description">
          {t('constructionHandoverForm.financingSection.deleteDialogContent')}
        </p>
      </Content>
      <ActionButtons>
        <Button onClick={onDeleteRow} data-testid="delete-financing-row-button">
          {t('delete')}
        </Button>
        <Button onClick={handleClose} variant={ButtonVariant.Secondary}>
          {t('cancel')}
        </Button>
      </ActionButtons>
    </Dialog>
  );
};

const FinancingDialog: FC<FinancingDialogProps> = ({
  handleClose,
  dialogState,
  onRowSaved,
  onRowDeleted,
}) => {
  const isDeleteDialog = dialogState.mode === 'delete';
  return isDeleteDialog ? (
    <DeleteRowDialog
      handleClose={handleClose}
      dialogState={dialogState}
      onRowSaved={onRowSaved}
      onRowDeleted={onRowDeleted}
    />
  ) : (
    <AddOrEditRowDialog
      handleClose={handleClose}
      dialogState={dialogState}
      onRowSaved={onRowSaved}
      onRowDeleted={onRowDeleted}
    />
  );
};

export default memo(FinancingDialog);
