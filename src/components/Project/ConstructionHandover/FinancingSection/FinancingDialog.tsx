import { useAppDispatch } from '@/hooks/common';
import {
  FinancingDialogDeleteProps,
  FinancingDialogModifyProps,
  FinancingDialogProps,
  FinancingRowRequest,
  FinancingRowValues,
} from '@/interfaces/constructionHandoverInterfaces';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useOptions } from '@/hooks/useOptions';
import useGetProject from '@/hooks/useGetProject';
import {
  useDeleteConstructionHandoverFinancingMutation,
  usePatchConstructionHandoverFinancingMutation,
  usePostConstructionHandoverFinancingMutation,
} from '@/api/constructionHandoverApi';
import {
  Button,
  ButtonVariant,
  Dialog,
  Notification,
  Select as HDSSelect,
  TextInput,
} from 'hds-react';
import { TFunction } from 'i18next';
import { ChangeEvent, FC, FocusEvent, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyToRequestValue, formatBudgetEuro, parseCurrency } from '@/utils/common';
import styles from '../styles.module.css';

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const mapDialogValuesToRequest = (
  values: FinancingRowValues,
  projectId: string | undefined,
): FinancingRowRequest => {
  const requestBudget = currencyToRequestValue(values.budget);

  return {
    financingParty: values.financer,
    description: values.description,
    budgetItemId: values.budgetItem,
    projectNumber: values.projectNumber,
    budget: requestBudget,
    project: projectId,
  };
};

const getSavedRowId = (saved: unknown): string | undefined => {
  if (!isRecord(saved)) {
    return undefined;
  }

  if (typeof saved.id === 'string') {
    return saved.id;
  }

  if (typeof saved.id === 'number') {
    return String(saved.id);
  }

  return undefined;
};

const AddOrEditRowDialog: FC<FinancingDialogModifyProps> = ({
  handleClose,
  dialogState,
  onRowSaved,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: project } = useGetProject();
  const [postConstructionHandoverFinancing] = usePostConstructionHandoverFinancingMutation();
  const [patchConstructionHandoverFinancing] = usePatchConstructionHandoverFinancingMutation();
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
      budget: formatBudgetEuro(dialogState.values?.budget ?? ''),
      id: dialogState.values?.id ?? '',
    });
  }, [dialogState]);

  const isOtherFinancingSelected = dialogValues.financer === 'OTHER';
  const isKympFinancingSelected = dialogValues.financer === 'KYMP';

  const fieldError = (value: string | undefined) => getFieldError(t, submitAttempted, value);
  const financerError = fieldError(dialogValues.financer);
  const budgetItemError = fieldError(dialogValues.budgetItem);
  const projectNumberError = fieldError(dialogValues.projectNumber);
  const descriptionError = fieldError(dialogValues.description);
  const budgetError = fieldError(dialogValues.budget);

  const handleDialogFieldChange = useCallback(
    (value: keyof FinancingRowValues, e: ChangeEvent<HTMLInputElement>) =>
      setDialogValues((prev) => ({
        ...prev,
        [value]: e.target.value,
      })),
    [],
  );

  const onSaveChange = useCallback(async () => {
    setSubmitAttempted(true);
    const parsedBudget = parseCurrency(dialogValues.budget);

    if (
      !dialogValues.financer ||
      (isKympFinancingSelected && !dialogValues.budgetItem) ||
      (isKympFinancingSelected && !dialogValues.projectNumber) ||
      parsedBudget === null ||
      (isOtherFinancingSelected && !dialogValues.description)
    ) {
      return;
    }

    const request = mapDialogValuesToRequest(dialogValues, project?.id);

    try {
      const savedRow =
        dialogState.mode === 'edit' && dialogValues.id
          ? await patchConstructionHandoverFinancing({ id: dialogValues.id, request }).unwrap()
          : await postConstructionHandoverFinancing(request).unwrap();

      const savedRowId = getSavedRowId(savedRow);

      onRowSaved(
        {
          ...dialogValues,
          id: dialogState.mode === 'edit' ? dialogValues.id : savedRowId ?? dialogValues.id,
        },
        dialogState.mode,
      );

      setDialogValues(emptyDialogValues);
      setSubmitAttempted(false);
      handleClose();

      dispatch(
        notifySuccess({
          message: dialogState.mode === 'edit' ? 'patchSuccess' : 'postSuccess',
          title: dialogState.mode === 'edit' ? 'patchSuccess' : 'postSuccess',
          type: 'toast',
          duration: 1500,
        }),
      );
    } catch {
      dispatch(
        notifyError({
          message: dialogState.mode === 'edit' ? 'patchError' : 'postError',
          title: dialogState.mode === 'edit' ? 'patchError' : 'postError',
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
    isOtherFinancingSelected,
    onRowSaved,
    patchConstructionHandoverFinancing,
    postConstructionHandoverFinancing,
    project?.id,
    t,
  ]);

  const onBudgetBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setDialogValues((prev) => ({
      ...prev,
      budget: formatBudgetEuro(e.target.value),
    }));
  }, []);

  return (
    <Dialog
      isOpen={dialogState.open}
      close={handleClose}
      id={`${dialogState.mode}-financing-row-dialog`}
      aria-labelledby={`${dialogState.mode}-financing-row-dialog-title`}
      aria-describedby={`${dialogState.mode}-financing-row-dialog-title`}
      closeButtonLabelText={t('constructionHandoverForm.financingSection.closeDialogButton')}
      className={styles.financingDialogContent}
    >
      <Header
        id={`${dialogState.mode}-financing-row-dialog-title`}
        title={t(`constructionHandoverForm.financingSection.${dialogState.mode}DialogTitle`)}
      />
      <Content className={styles.financingDialogContent}>
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
                      budget: formatBudgetEuro(project?.budget ?? '0'),
                    }
                  : {
                      description: selectedFinancingParty === 'OTHER' ? prev.description ?? '' : '',
                      budgetItem: '',
                      projectNumber: '',
                      budget: '',
                    }),
              }));
            }}
            invalid={financerError !== undefined}
            required
            texts={{
              label: t('constructionHandoverForm.financingSection.label.financer'),
              error: financerError,
              placeholder: t('choose'),
            }}
          />
        </div>
        {isKympFinancingSelected && (
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
              invalid={budgetItemError !== undefined}
              required
              texts={{
                label: t('constructionHandoverForm.financingSection.label.budgetItem'),
                error: budgetItemError,
                placeholder: t('choose'),
              }}
            />
          </div>
        )}
        {isKympFinancingSelected && (
          <>
            <TextInput
              className={styles.financingDialogInput}
              id="financing-dialog-project-number-input"
              label={t('constructionHandoverForm.financingSection.label.projectNumber')}
              value={dialogValues.projectNumber}
              onChange={(e) => handleDialogFieldChange('projectNumber', e)}
              data-testid="financing-dialog-project-number-input"
              errorText={projectNumberError}
              invalid={projectNumberError !== undefined}
              required
            />
            {dialogState.mode === 'edit' &&
              dialogValues.financer === 'KYMP' &&
              !dialogValues.projectNumber && (
                <Notification
                  label=""
                  type="alert"
                  position="inline"
                  data-testid="financing-project-number-warning"
                >
                  {t('constructionHandoverForm.financingSection.projectNumberWarning')}
                </Notification>
              )}
          </>
        )}
        {isOtherFinancingSelected && (
          <TextInput
            className={styles.financingDialogInput}
            id="financing-dialog-description-input"
            label={t('constructionHandoverForm.description')}
            value={dialogValues.description ?? ''}
            onChange={(e) => handleDialogFieldChange('description', e)}
            data-testid="financing-dialog-description-input"
            errorText={descriptionError}
            invalid={descriptionError !== undefined}
            required
          />
        )}
        <TextInput
          className={styles.financingDialogInput}
          id="financing-dialog-budget-input"
          label={t('constructionHandoverForm.financingSection.label.budget')}
          value={dialogValues.budget}
          onBlur={onBudgetBlur}
          data-testid="financing-dialog-budget-input"
          errorText={budgetError}
          invalid={budgetError !== undefined}
          required
        />
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

const DeleteRowDialog: FC<FinancingDialogDeleteProps> = ({
  handleClose,
  dialogState,
  onRowDeleted,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [deleteConstructionHandoverFinancing] = useDeleteConstructionHandoverFinancingMutation();
  const { Header, ActionButtons, Content } = Dialog;
  const [deletableItemId, setDeletableItemId] = useState<string>('');

  useEffect(() => {
    setDeletableItemId(dialogState.itemId);
  }, [dialogState]);

  const onDeleteRow = useCallback(async () => {
    if (!deletableItemId) return;
    try {
      await deleteConstructionHandoverFinancing(deletableItemId).unwrap();
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
  }, [deleteConstructionHandoverFinancing, deletableItemId, dispatch, handleClose, onRowDeleted]);

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
      onRowDeleted={onRowDeleted}
    />
  ) : (
    <AddOrEditRowDialog
      handleClose={handleClose}
      dialogState={dialogState}
      onRowSaved={onRowSaved}
    />
  );
};

export default memo(FinancingDialog);
