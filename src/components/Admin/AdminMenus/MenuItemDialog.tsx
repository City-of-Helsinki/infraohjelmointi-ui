import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IError } from '@/interfaces/common';
import {
  DialogState,
  MenuItemDialogMessages,
  PersonTypeDialogValues,
} from '@/interfaces/menuItemsInterfaces';
import {
  deleteMenuItemsThunk,
  patchMenuItemsThunk,
  postMenuItemsThunk,
} from '@/reducers/listsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { Button, ButtonVariant, Dialog, TextInput } from 'hds-react';
import { TFunction } from 'i18next';
import { ChangeEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ModifyMenuItemDialogProps {
  dialogState: DialogState;
  handleClose: () => void;
  dialogMessages: MenuItemDialogMessages;
}

const getFieldError = (
  t: TFunction<'translation'>,
  submitAttempted: boolean,
  value: string | undefined,
) => {
  if (!submitAttempted) return undefined;
  return !value ? t('adminFunctions.menus.requiredField') : undefined;
};

const AddOrEditMenuItemDialog: FC<ModifyMenuItemDialogProps> = ({
  handleClose,
  dialogState,
  dialogMessages,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const [menuItemName, setMenuItemName] = useState<string>('');
  const [editableItemId, setEditableItemId] = useState<string>('');
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

  useEffect(() => {
    setMenuItemName(dialogState.value);
    setEditableItemId(dialogState.menuItemId);
  }, [dialogState]);

  const onSetMenuItemName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setMenuItemName(e.target.value),
    [],
  );

  const onSaveMenuItemChange = useCallback(async () => {
    setSubmitAttempted(true);
    if (!menuItemName || !dialogState.listType) return;
    try {
      if (dialogState.mode === 'edit') {
        await dispatch(
          patchMenuItemsThunk({
            request: { value: menuItemName },
            path: dialogState.path,
            id: editableItemId,
            listType: dialogState.listType,
          }),
        ).unwrap();
      } else {
        await dispatch(
          postMenuItemsThunk({
            request: { value: menuItemName },
            path: dialogState.path,
            listType: dialogState.listType,
          }),
        ).unwrap();
      }
      setMenuItemName('');
      setSubmitAttempted(false);
      handleClose();

      dispatch(
        notifySuccess({
          message: dialogMessages.submitSuccessMessage,
          title: dialogMessages.submitSuccessTitle,
          type: 'toast',
          duration: 1500,
        }),
      );
    } catch {
      dispatch(
        notifyError({
          message: dialogMessages.submitError,
          title: dialogMessages.submitError,
          type: 'toast',
          duration: 1500,
        }),
      );
    }
  }, [
    menuItemName,
    dialogState.path,
    dispatch,
    handleClose,
    dialogMessages.submitError,
    dialogMessages.submitSuccessTitle,
    dialogMessages.submitSuccessMessage,
    dialogState.mode,
    editableItemId,
    dialogState.listType,
  ]);

  return (
    <Dialog
      isOpen={dialogState.open}
      close={handleClose}
      id={dialogMessages.dialogId}
      aria-labelledby={dialogMessages.titleId}
      aria-describedby={dialogMessages.descriptionId}
      closeButtonLabelText={dialogMessages.closeButtonLabelText}
    >
      <Header id={dialogMessages.titleId} title={dialogMessages.dialogHeader} />
      <Content>
        <TextInput
          id={`${dialogMessages.dialogInputId}-value`}
          label={t(`adminFunctions.menus.inputLabel.value.${dialogState.mode}`)}
          value={menuItemName}
          onChange={onSetMenuItemName}
          data-testid={`${dialogMessages.dialogInputId}-value`}
          errorText={getFieldError(t, submitAttempted, menuItemName)}
          invalid={getFieldError(t, submitAttempted, menuItemName) !== undefined}
          required
        />
      </Content>
      <ActionButtons>
        <Button onClick={onSaveMenuItemChange} data-testid="submit-menu-item-button">
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

const emptyPersonTypeDialogValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
};

const PersonTypeMenuItemDialog: FC<ModifyMenuItemDialogProps> = ({
  handleClose,
  dialogState,
  dialogMessages,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const isResponsiblePersonDialog = dialogState.listType === 'responsiblePersonsRaw';
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [editableItemId, setEditableItemId] = useState<string>('');
  const [personTypeDialogValues, setPersonTypeDialogValues] = useState<PersonTypeDialogValues>(
    emptyPersonTypeDialogValues,
  );

  useEffect(() => {
    const baseValues = {
      firstName: dialogState.personTypeDialogValues?.firstName ?? '',
      lastName: dialogState.personTypeDialogValues?.lastName ?? '',
    };

    setPersonTypeDialogValues({
      ...baseValues,
      ...(isResponsiblePersonDialog && {
        email: dialogState.personTypeDialogValues?.email ?? '',
        phone: dialogState.personTypeDialogValues?.phone ?? '',
        title: dialogState.personTypeDialogValues?.title ?? '',
      }),
    });

    setEditableItemId(dialogState.menuItemId);
  }, [dialogState, isResponsiblePersonDialog]);

  const onSetMenuItemName = useCallback(
    (value: keyof PersonTypeDialogValues, e: ChangeEvent<HTMLInputElement>) =>
      setPersonTypeDialogValues((prev) => ({
        ...prev,
        [value]: e.target.value,
      })),
    [],
  );

  const onSaveMenuItemChange = useCallback(async () => {
    setSubmitAttempted(true);
    if (!Object.values(personTypeDialogValues).every(Boolean) || !dialogState.listType) return;

    const baseRequest = {
      firstName: personTypeDialogValues.firstName,
      lastName: personTypeDialogValues.lastName,
    };

    const fullRequest = isResponsiblePersonDialog
      ? {
          ...baseRequest,
          email: personTypeDialogValues.email,
          phone: personTypeDialogValues.phone,
          title: personTypeDialogValues.title,
        }
      : baseRequest;

    try {
      if (dialogState.mode === 'edit') {
        await dispatch(
          patchMenuItemsThunk({
            request: fullRequest,
            id: editableItemId,
            path: dialogState.path,
            listType: dialogState.listType,
          }),
        ).unwrap();
      } else {
        await dispatch(
          postMenuItemsThunk({
            request: fullRequest,
            path: dialogState.path,
            listType: dialogState.listType,
          }),
        ).unwrap();
      }
      setPersonTypeDialogValues(emptyPersonTypeDialogValues);
      setSubmitAttempted(false);
      handleClose();

      dispatch(
        notifySuccess({
          message: dialogMessages.submitSuccessMessage,
          title: dialogMessages.submitSuccessTitle,
          type: 'toast',
          duration: 1500,
        }),
      );
    } catch {
      dispatch(
        notifyError({
          message: dialogMessages.submitError,
          title: dialogMessages.submitError,
          type: 'toast',
          duration: 1500,
        }),
      );
    }
  }, [
    personTypeDialogValues,
    dialogState.listType,
    dialogState.mode,
    dialogState.path,
    isResponsiblePersonDialog,
    handleClose,
    dispatch,
    dialogMessages.submitSuccessMessage,
    dialogMessages.submitSuccessTitle,
    dialogMessages.submitError,
    editableItemId,
  ]);

  return (
    <Dialog
      isOpen={dialogState.open}
      close={handleClose}
      id={dialogMessages.dialogId}
      aria-labelledby={dialogMessages.titleId}
      aria-describedby={dialogMessages.descriptionId}
      closeButtonLabelText={dialogMessages.closeButtonLabelText}
    >
      <Header id={dialogMessages.titleId} title={dialogMessages.dialogHeader} />
      <Content>
        <TextInput
          id={`${dialogMessages.dialogInputId}-first-name`}
          label={t('adminFunctions.menus.inputLabel.firstName')}
          value={personTypeDialogValues.firstName}
          onChange={(e) => onSetMenuItemName('firstName', e)}
          data-testid={`${dialogMessages.dialogInputId}-first-name`}
          errorText={getFieldError(t, submitAttempted, personTypeDialogValues.firstName)}
          invalid={
            getFieldError(t, submitAttempted, personTypeDialogValues.firstName) !== undefined
          }
          required
        />
        <TextInput
          id={`${dialogMessages.dialogInputId}-last-name`}
          label={t('adminFunctions.menus.inputLabel.lastName')}
          value={personTypeDialogValues.lastName}
          onChange={(e) => onSetMenuItemName('lastName', e)}
          data-testid={`${dialogMessages.dialogInputId}-last-name`}
          errorText={getFieldError(t, submitAttempted, personTypeDialogValues.lastName)}
          invalid={getFieldError(t, submitAttempted, personTypeDialogValues.lastName) !== undefined}
          required
        />
        {isResponsiblePersonDialog && (
          <>
            <TextInput
              id={`${dialogMessages.dialogInputId}-title`}
              label={t('adminFunctions.menus.inputLabel.title')}
              value={personTypeDialogValues.title}
              onChange={(e) => onSetMenuItemName('title', e)}
              data-testid={`${dialogMessages.dialogInputId}-title`}
              errorText={getFieldError(t, submitAttempted, personTypeDialogValues.title)}
              invalid={
                getFieldError(t, submitAttempted, personTypeDialogValues.title) !== undefined
              }
              required={isResponsiblePersonDialog}
            />
            <TextInput
              id={`${dialogMessages.dialogInputId}-email`}
              label={t('adminFunctions.menus.inputLabel.email')}
              value={personTypeDialogValues.email}
              onChange={(e) => onSetMenuItemName('email', e)}
              data-testid={`${dialogMessages.dialogInputId}-email`}
              errorText={getFieldError(t, submitAttempted, personTypeDialogValues.email)}
              invalid={
                getFieldError(t, submitAttempted, personTypeDialogValues.email) !== undefined
              }
              required={isResponsiblePersonDialog}
            />
            <TextInput
              id={`${dialogMessages.dialogInputId}-phone-number`}
              label={t('adminFunctions.menus.inputLabel.phoneNumber')}
              value={personTypeDialogValues.phone}
              onChange={(e) => onSetMenuItemName('phone', e)}
              data-testid={`${dialogMessages.dialogInputId}-phone-number`}
              errorText={getFieldError(t, submitAttempted, personTypeDialogValues.phone)}
              invalid={
                getFieldError(t, submitAttempted, personTypeDialogValues.phone) !== undefined
              }
              required={isResponsiblePersonDialog}
            />
          </>
        )}
      </Content>
      <ActionButtons>
        <Button onClick={onSaveMenuItemChange} data-testid="submit-person-type-menu-item-button">
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

const DeleteMenuItemDialog: FC<ModifyMenuItemDialogProps> = ({
  handleClose,
  dialogState,
  dialogMessages,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, ActionButtons, Content } = Dialog;
  const [deletableItemId, setDeletableItemId] = useState<string>('');

  useEffect(() => {
    setDeletableItemId(dialogState.menuItemId);
  }, [dialogState]);

  const onDeleteMenuItem = useCallback(async () => {
    if (!deletableItemId || !dialogState.listType) return;
    try {
      await dispatch(
        deleteMenuItemsThunk({
          path: dialogState.path,
          id: deletableItemId,
          listType: dialogState.listType,
          dispatch: dispatch,
        }),
      ).unwrap();
      handleClose();

      dispatch(
        notifySuccess({
          message: dialogMessages.submitSuccessMessage,
          title: dialogMessages.submitSuccessTitle,
          type: 'toast',
          duration: 1500,
        }),
      );
    } catch {
      dispatch(
        notifyError({
          message: 'deleteError',
          title: 'deleteError',
          type: 'toast',
          duration: 1500,
        }),
      );
    }
  }, [
    deletableItemId,
    dialogState.listType,
    dialogState.path,
    dispatch,
    handleClose,
    dialogMessages.submitSuccessMessage,
    dialogMessages.submitSuccessTitle,
  ]);

  return (
    <Dialog
      isOpen={dialogState.open}
      close={handleClose}
      id={dialogMessages.dialogId}
      aria-labelledby={dialogMessages.titleId}
      aria-describedby={dialogMessages.descriptionId}
      closeButtonLabelText={dialogMessages.closeButtonLabelText}
    >
      <Header id={dialogMessages.titleId} title={dialogMessages.dialogHeader} />
      <Content>
        <p>{t('adminFunctions.menus.deleteDialogContent')}</p>
      </Content>
      <ActionButtons>
        <Button onClick={onDeleteMenuItem} data-testid="delete-menu-item-button">
          {t('delete')}
        </Button>
        <Button onClick={handleClose} variant={ButtonVariant.Secondary}>
          {t('cancel')}
        </Button>
      </ActionButtons>
    </Dialog>
  );
};

interface MenuItemDialogProps {
  dialogState: DialogState;
  handleClose: () => void;
}

const MenuItemDialog: FC<MenuItemDialogProps> = ({ handleClose, dialogState }) => {
  const { t } = useTranslation();

  const isDeleteDialog = dialogState.mode === 'delete';
  const isPersonTypeMenu =
    dialogState.listType === 'responsiblePersonsRaw' || dialogState.listType === 'programmersRaw';

  const sharedDialogMessages: MenuItemDialogMessages = {
    submitSuccessTitle: t(`${dialogState.mode}MenuItemSuccess`),
    submitSuccessMessage: t(`${dialogState.mode}MenuItemSuccess`),
    submitError: t(dialogState.mode === 'add' ? 'postError' : 'patchError'),
    dialogId: `${dialogState.mode}-menu-item-dialog`,
    titleId: `${dialogState.mode}-menu-item-title`,
    descriptionId: `${dialogState.mode}-menu-item-content`,
    closeButtonLabelText: t('closeDialog'),
    dialogHeader: t(`adminFunctions.menus.${dialogState.mode}ItemDialogHeader`),
    dialogInputId: `${dialogState.mode}-menu-item-input`,
  };

  let dialogComponent;
  if (isDeleteDialog) {
    dialogComponent = (
      <DeleteMenuItemDialog
        handleClose={handleClose}
        dialogState={dialogState}
        dialogMessages={sharedDialogMessages}
      />
    );
  } else if (isPersonTypeMenu) {
    dialogComponent = (
      <PersonTypeMenuItemDialog
        handleClose={handleClose}
        dialogState={dialogState}
        dialogMessages={sharedDialogMessages}
      />
    );
  } else {
    dialogComponent = (
      <AddOrEditMenuItemDialog
        handleClose={handleClose}
        dialogState={dialogState}
        dialogMessages={sharedDialogMessages}
      />
    );
  }

  return <>{dialogComponent}</>;
};

export default memo(MenuItemDialog);
