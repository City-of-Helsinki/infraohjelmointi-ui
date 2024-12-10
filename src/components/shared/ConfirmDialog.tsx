import useConfirmDialog from '@/hooks/useConfirmDialog';
import { Dialog, Button, IconQuestionCircle, ButtonVariant, ButtonPresetTheme } from 'hds-react';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';

const titleId = 'confirmation-dialog-title';
const descriptionId = 'confirmation-dialog-info';

/**
 * Listens to ConfirmDialogContext and renders if isOpen is true, this will also cause a
 * promise that waits for the user to either click the confirm or cancel buttons.
 *
 * This component is rendered at the bottom of App.tsx and triggering it should only be done using the useConfirmDialog()-hook.
 */
const ConfirmDialog = () => {
  const openConfirmationDialogButtonRef = useRef(null);
  const { t } = useTranslation();

  const { title, description, isOpen, proceed, cancel, dialogType, confirmButtonText } =
    useConfirmDialog();

  const confirmButtonVariant = useMemo(
    () => (dialogType === 'delete' ? ButtonVariant.Danger : ButtonVariant.Primary),
    [dialogType],
  );
  const confirmButtonIcon = useMemo(
    () => (dialogType === 'delete' ? <IconTrash aria-hidden="true" /> : ''),
    [dialogType],
  );

  return (
    <Dialog
      id="confirmation-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      focusAfterCloseRef={openConfirmationDialogButtonRef}
      variant={dialogType === 'delete' ? 'danger' : 'primary'}
    >
      <Dialog.Header
        id={titleId}
        title={title}
        iconStart={
          dialogType === 'delete' ? (
            <IconAlertCircle aria-hidden="true" />
          ) : (
            <IconQuestionCircle aria-hidden="true" />
          )
        }
      />
      <Dialog.Content>
        <p id={descriptionId} className="text-body">
          {description}
        </p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          onClick={cancel as (value: unknown) => void}
          variant={ButtonVariant.Secondary}
          theme={dialogType === 'delete' ? ButtonPresetTheme.Black : ButtonPresetTheme.Coat}
        >
          {t('cancel')}
        </Button>
        <Button
          data-testid={'confirm-dialog-button'}
          onClick={proceed as (value: unknown) => void}
          variant={confirmButtonVariant}
          iconStart={confirmButtonIcon}
        >
          {t(confirmButtonText || 'proceed')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default ConfirmDialog;
