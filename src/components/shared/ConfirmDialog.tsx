import useConfirmDialog from '@/hooks/useConfirmDialog';
import { Dialog, Button, IconQuestionCircle } from 'hds-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';

/**
 * Listens to ConfirmDialogContext and renders if isOpen is true, this will also cause a
 * promise that waits for the user to either click the confirm or cancel buttons.
 *
 * This component is rendered at the bottom of App.tsx and triggering it should only be done using the useConfirmDialog()-hook.
 */
const ConfirmDialog = () => {
  const openConfirmationDialogButtonRef = useRef(null);
  const titleId = 'confirmation-dialog-title';
  const descriptionId = 'confirmation-dialog-info';
  const { t } = useTranslation();

  const { title, description, isOpen, proceed, cancel, dialogType } = useConfirmDialog();

  return (
    <Dialog
      id="confirmation-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      focusAfterCloseRef={openConfirmationDialogButtonRef}
      variant={dialogType === 'deleteProject' ? 'danger' : 'primary'}
    >
      <Dialog.Header
        id={titleId}
        title={title}
        iconLeft={
          dialogType === 'deleteProject' ? (
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
          variant="secondary"
          theme={dialogType === 'deleteProject' ? 'black' : 'default'}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={proceed as (value: unknown) => void}
          variant={dialogType === 'deleteProject' ? 'danger' : 'primary'}
          iconLeft={dialogType === 'deleteProject' ? <IconTrash aria-hidden="true" /> : ''}
        >
          {dialogType === 'deleteProject' ? t(`deleteProject`) : t('proceed')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default ConfirmDialog;
