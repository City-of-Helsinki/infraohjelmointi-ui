import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IError } from '@/interfaces/common';
import { DialogState, MenuItemDialogMessages } from '@/interfaces/menuItemsInterfaces';
import { patchMenuItemsThunk, postMenuItemsThunk, selectLists } from '@/reducers/listsSlice';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { getErrorText } from '@/utils/validation';
import { Button, ButtonVariant, Dialog, TextInput } from 'hds-react';
import { ChangeEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddOrEditMenuItemDialogProps {
  dialogState: DialogState;
  handleClose: () => void;
}

const AddOrEditMenuItemDialog: FC<AddOrEditMenuItemDialogProps> = ({
  handleClose,
  dialogState,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const [menuItemName, setMenuItemName] = useState<string>('');
  const [editableItemId, setEditableItemId] = useState<string>('');

  const dialogMessages: MenuItemDialogMessages = {
    submitSuccess: t(dialogState.mode === 'add' ? 'postSuccess' : 'patchSuccess'),
    submitError: t(dialogState.mode === 'add' ? 'postError' : 'patchError'),
    dialogId: `${dialogState.mode}-menu-item-dialog`,
    titleId: `${dialogState.mode}-menu-item-title`,
    descriptionId: `${dialogState.mode}-menu-item-content`,
    closeButtonLabelText: t('closeDialog'),
    dialogHeader: t(`adminFunctions.menus.${dialogState.mode}ItemDialogHeader`),
    dialogInputId: `${dialogState.mode}-menu-item-input`,
    inputLabel: t(`adminFunctions.menus.${dialogState.mode}ItemInputLabel`),
  };

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
    if (!menuItemName) return;
    try {
      if (dialogState.mode === 'edit') {
        await dispatch(
          patchMenuItemsThunk({
            request: { id: editableItemId, data: menuItemName },
            path: dialogState.path,
          }),
        ).unwrap();
      } else {
        await dispatch(
          postMenuItemsThunk({ request: { value: menuItemName }, path: dialogState.path }),
        ).unwrap();
      }
      setMenuItemName('');
      handleClose();

      dispatch(
        notifySuccess({
          message: dialogMessages.submitSuccess,
          title: dialogMessages.submitSuccess,
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
    dialogMessages.submitSuccess,
    dialogState.mode,
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
            id={dialogMessages.dialogInputId}
            label={dialogMessages.inputLabel}
            value={menuItemName}
            onChange={onSetMenuItemName}
            data-testid={dialogMessages.dialogInputId}
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

export default memo(AddOrEditMenuItemDialog);
