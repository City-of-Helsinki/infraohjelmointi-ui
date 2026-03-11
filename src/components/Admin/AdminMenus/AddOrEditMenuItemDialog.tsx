import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IError } from '@/interfaces/common';
import {
  DialogState,
  MenuItemDialogMessages,
  PersonTypeDialogValues,
} from '@/interfaces/menuItemsInterfaces';
import {
  patchMenuItemsThunk,
  patchPersonTypeMenuItemsThunk,
  postMenuItemsThunk,
  postPersonTypeMenuItemsThunk,
  selectLists,
} from '@/reducers/listsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { getErrorText } from '@/utils/validation';
import { Button, ButtonVariant, Dialog, TextInput } from 'hds-react';
import { ChangeEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MenuItemDialogProps {
  dialogState: DialogState;
  handleClose: () => void;
  dialogMessages: MenuItemDialogMessages;
}

const MenuItemDialog: FC<MenuItemDialogProps> = ({ handleClose, dialogState, dialogMessages }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const [menuItemName, setMenuItemName] = useState<string>('');
  const [editableItemId, setEditableItemId] = useState<string>('');

  useEffect(() => {
    setMenuItemName(dialogState.value);
    setEditableItemId(dialogState.editableItemId);
  }, [dialogState]);

  const error = useAppSelector(selectLists).error as IError;

  const onSetMenuItemName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setMenuItemName(e.target.value),
    [],
  );

  const onSaveMenuItemChange = useCallback(async () => {
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
    <>
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
            label={dialogMessages.valueInputLabel}
            value={menuItemName}
            onChange={onSetMenuItemName}
            data-testid={`${dialogMessages.dialogInputId}-value`}
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
          />
        </Content>
        <ActionButtons>
          <Button onClick={onSaveMenuItemChange} data-testid="submit-menu-item-button">
            {t('save')}
          </Button>
          <Button onClick={handleClose} variant={ButtonVariant.Secondary}>
            {t('cancel')}
          </Button>
        </ActionButtons>
      </Dialog>
    </>
  );
};

const emptyPersonTypeDialogValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  title: '',
};

const PersonTypeMenuItemDialog: FC<MenuItemDialogProps> = ({
  handleClose,
  dialogState,
  dialogMessages,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const [personTypeDialogValues, setPersonTypeDialogValues] = useState<PersonTypeDialogValues>(
    emptyPersonTypeDialogValues,
  );

  const [editableItemId, setEditableItemId] = useState<string>('');

  useEffect(() => {
    setPersonTypeDialogValues({
      firstName: dialogState.personTypeDialogValues?.firstName,
      lastName: dialogState.personTypeDialogValues?.lastName,
      email: dialogState.personTypeDialogValues?.email,
      phone: dialogState.personTypeDialogValues?.phone,
      title: dialogState.personTypeDialogValues?.title,
    });

    setEditableItemId(dialogState.editableItemId);
  }, [dialogState]);

  const error = useAppSelector(selectLists).error as IError;

  const onSetMenuItemName = useCallback(
    (
      value: 'firstName' | 'lastName' | 'email' | 'phone' | 'title',
      e: ChangeEvent<HTMLInputElement>,
    ) => setPersonTypeDialogValues({ ...personTypeDialogValues, [value]: e.target.value }),
    [personTypeDialogValues],
  );

  const onSaveMenuItemChange = useCallback(async () => {
    if (!Object.values(personTypeDialogValues).every((value) => !value) || !dialogState.listType)
      return;

    try {
      if (dialogState.mode === 'edit') {
        await dispatch(
          patchPersonTypeMenuItemsThunk({
            request: {
              firstName: personTypeDialogValues.firstName,
              lastName: personTypeDialogValues.lastName,
              phone: personTypeDialogValues.phone,
              email: personTypeDialogValues.email,
              title: personTypeDialogValues.title,
            },
            id: editableItemId,
            path: dialogState.path,
            listType: dialogState.listType,
          }),
        ).unwrap();
      } else {
        await dispatch(
          postPersonTypeMenuItemsThunk({
            request: {
              firstName: personTypeDialogValues.firstName,
              lastName: personTypeDialogValues.lastName,
              phone: personTypeDialogValues.phone,
              email: personTypeDialogValues.email,
              title: personTypeDialogValues.title,
            },
            path: dialogState.path,
            listType: dialogState.listType,
          }),
        ).unwrap();
      }
      setPersonTypeDialogValues(emptyPersonTypeDialogValues);
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
    handleClose,
    dispatch,
    dialogMessages.submitSuccessMessage,
    dialogMessages.submitSuccessTitle,
    dialogMessages.submitError,
    editableItemId,
  ]);

  return (
    <>
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
            label={dialogMessages.firstNameInputLabel}
            value={personTypeDialogValues.firstName}
            onChange={(e) => onSetMenuItemName('firstName', e)}
            data-testid={`${dialogMessages.dialogInputId}-first-name`}
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
            required
          />
          <TextInput
            id={`${dialogMessages.dialogInputId}-last-name`}
            label={dialogMessages.lastNameInputLabel}
            value={personTypeDialogValues.lastName}
            onChange={(e) => onSetMenuItemName('lastName', e)}
            data-testid={`${dialogMessages.dialogInputId}-last-name`}
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
            required
          />
          <TextInput
            id={`${dialogMessages.dialogInputId}-title`}
            label={dialogMessages.titleInputLabel}
            value={personTypeDialogValues.title}
            onChange={(e) => onSetMenuItemName('title', e)}
            data-testid={`${dialogMessages.dialogInputId}-title`}
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
          />
          <TextInput
            id={`${dialogMessages.dialogInputId}-email`}
            label={dialogMessages.emailInputLabel}
            value={personTypeDialogValues.email}
            onChange={(e) => onSetMenuItemName('email', e)}
            data-testid={`${dialogMessages.dialogInputId}-email`}
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
            required={dialogState.listType === 'responsiblePersonsRaw'}
          />
          <TextInput
            id={`${dialogMessages.dialogInputId}-phone-number`}
            label={dialogMessages.phoneNumberInputLabel}
            value={personTypeDialogValues.phone}
            onChange={(e) => onSetMenuItemName('phone', e)}
            data-testid={`${dialogMessages.dialogInputId}-phone-number`}
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
          />
        </Content>
        <ActionButtons>
          <Button onClick={onSaveMenuItemChange} data-testid="submit-person-type-menu-item-button">
            {t('save')}
          </Button>
          <Button onClick={handleClose} variant={ButtonVariant.Secondary}>
            {t('cancel')}
          </Button>
        </ActionButtons>
      </Dialog>
    </>
  );
};

interface AddOrEditMenuItemDialogProps {
  dialogState: DialogState;
  handleClose: () => void;
}

const AddOrEditMenuItemDialog: FC<AddOrEditMenuItemDialogProps> = ({
  handleClose,
  dialogState,
}) => {
  const { t } = useTranslation();

  const isPersonTypeMenu =
    dialogState.listType === 'responsiblePersonsRaw' || dialogState.listType === 'programmersRaw';

  const dialogMessages: MenuItemDialogMessages = {
    submitSuccessTitle: t(
      dialogState.mode === 'add' ? 'adminMenuPostSuccess' : 'adminMenuPatchSuccess',
    ),
    submitSuccessMessage: t(
      dialogState.mode === 'add' ? 'adminMenuPostSuccess' : 'adminMenuPatchSuccess',
    ),
    submitError: t(dialogState.mode === 'add' ? 'postError' : 'patchError'),
    dialogId: `${dialogState.mode}-menu-item-dialog`,
    titleId: `${dialogState.mode}-menu-item-title`,
    descriptionId: `${dialogState.mode}-menu-item-content`,
    closeButtonLabelText: t('closeDialog'),
    dialogHeader: t(`adminFunctions.menus.${dialogState.mode}ItemDialogHeader`),
    dialogInputId: `${dialogState.mode}-menu-item-input`,
    firstNameInputLabel: t('adminFunctions.menus.inputLabel.firstName'),
    lastNameInputLabel: t('adminFunctions.menus.inputLabel.lastName'),
    emailInputLabel: t('adminFunctions.menus.inputLabel.email'),
    phoneNumberInputLabel: t('adminFunctions.menus.inputLabel.phoneNumber'),
    titleInputLabel: t('adminFunctions.menus.inputLabel.title'),
    valueInputLabel: t(`adminFunctions.menus.inputLabel.value.${dialogState.mode}`),
  };

  return (
    <>
      {isPersonTypeMenu ? (
        <PersonTypeMenuItemDialog
          handleClose={handleClose}
          dialogState={dialogState}
          dialogMessages={dialogMessages}
        />
      ) : (
        <MenuItemDialog
          handleClose={handleClose}
          dialogState={dialogState}
          dialogMessages={dialogMessages}
        />
      )}
    </>
  );
};

export default memo(AddOrEditMenuItemDialog);
