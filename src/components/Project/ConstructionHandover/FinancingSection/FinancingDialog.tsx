import { useAppDispatch } from '@/hooks/common';
import {
  FinancingDialogState,
  FinancingRowValues,
  FinancingRowDeleteThunkContent,
  FinancingRowPostAndPatchThunkContent,
} from '@/interfaces/constructionHandoverInterfaces';
import { DialogMode } from '@/interfaces/menuItemsInterfaces';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useOptions } from '@/hooks/useOptions';
import useGetProject from '@/hooks/useGetProject';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Button, ButtonVariant, Dialog, Select as HDSSelect, TextInput } from 'hds-react';
import { TFunction } from 'i18next';
import { ChangeEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
const { REACT_APP_API_URL } = process.env;

export const postFinancingRow = async (request: FinancingRowValues) => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/construction-handover/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchFinancingRow = async (request: FinancingRowValues, itemId: string) => {
  try {
    const res = await axios.patch(`${REACT_APP_API_URL}/construction-handover/${itemId}/`, request);
    return res.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteFinancingRow = async (itemId: string) => {
  try {
    await axios.delete(`${REACT_APP_API_URL}/construction-handover/${itemId}/`);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const patchFinancingRowThunk = createAsyncThunk(
  'listItem/patch',
  async (thunkContent: FinancingRowPostAndPatchThunkContent, thunkAPI) => {
    try {
      const listItem = await patchFinancingRow(thunkContent.request, thunkContent.request.id);
      return listItem;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const postFinancingRowThunk = createAsyncThunk(
  'listItem/post',
  async (thunkContent: FinancingRowPostAndPatchThunkContent, thunkAPI) => {
    try {
      const listItem = await postFinancingRow(thunkContent.request);
      return listItem;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const deleteFinancingRowThunk = createAsyncThunk(
  'listItem/delete',
  async (thunkContent: FinancingRowDeleteThunkContent, thunkAPI) => {
    try {
      await deleteFinancingRow(thunkContent.id);
      // thunkContent.dispatch(deleteRow({ rowId: thunkContent.id }));
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

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

const emptyDialogValues = {
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
    return {
      ...fallbackValues,
      id: fallbackValues.id,
    };
  }

  const row = saved as Record<string, unknown>;

  return {
    financer: String(row.financer ?? row.financingParty ?? fallbackValues.financer ?? ''),
    description: String(row.description ?? fallbackValues.description ?? ''),
    budgetItem: String(row.budgetItem ?? fallbackValues.budgetItem ?? ''),
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
      (isOtherFinancingSelected && !dialogValues.description)
    ) {
      return;
    }

    const baseRequest = {
      financer: dialogValues.financer,
      description: dialogValues.description,
      budgetItem: dialogValues.budgetItem,
      projectNumber: dialogValues.projectNumber,
      budget: dialogValues.budget,
    };

    try {
      // Financing row API endpoints are not available yet.
      // Save rows to form state locally to avoid failing requests.
      onRowSaved(
        normalizeSavedRow(undefined, {
          ...baseRequest,
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
    handleClose,
    dispatch,
    isOtherFinancingSelected,
    onRowSaved,
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
                      budgetItem: project?.siteId?.site ?? project?.siteId?.siteName ?? '',
                      projectNumber: project?.sapProject ?? '',
                      budget: project?.totalCost ?? project?.budget ?? project?.costForecast ?? '',
                    }
                  : {
                      description: selectedFinancingParty === 'OTHER' ? prev.description ?? '' : '',
                      budgetItem: '',
                      projectNumber: '',
                      budget: '',
                    }),
              }));
            }}
            invalid={getFieldError(t, submitAttempted, dialogValues.financer) !== undefined}
            required
            texts={{
              label: t('constructionHandoverForm.financingSection.label.financer'),
              error: getFieldError(t, submitAttempted, dialogValues.financer),
              placeholder: t('choose'),
            }}
          />
        </div>
        <TextInput
          id="financing-dialog-budget-item-input"
          label={t('constructionHandoverForm.financingSection.label.budgetItem')}
          value={dialogValues.budgetItem}
          onChange={(e) => onSetMenuItemName('budgetItem', e)}
          data-testid="financing-dialog-budget-item-input"
          errorText={getFieldError(t, submitAttempted, dialogValues.budgetItem)}
          invalid={getFieldError(t, submitAttempted, dialogValues.budgetItem) !== undefined}
          required
        />
        <TextInput
          id="financing-dialog-project-number-input"
          label={t('constructionHandoverForm.financingSection.label.projectNumber')}
          value={dialogValues.projectNumber}
          onChange={(e) => onSetMenuItemName('projectNumber', e)}
          data-testid="financing-dialog-project-number-input"
          errorText={getFieldError(t, submitAttempted, dialogValues.projectNumber)}
          invalid={getFieldError(t, submitAttempted, dialogValues.projectNumber) !== undefined}
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
        {isOtherFinancingSelected && (
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
      await dispatch(
        deleteFinancingRowThunk({
          id: deletableItemId,
          dispatch: dispatch,
        }),
      ).unwrap();
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
