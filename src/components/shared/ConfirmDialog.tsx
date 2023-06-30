import useConfirmDialog from '@/hooks/useConfirmDialog';
import { Dialog, Button, IconQuestionCircle } from 'hds-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

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

  const { title, description, isOpen, proceed, cancel } = useConfirmDialog();

  return (
    <Dialog
      id="confirmation-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      focusAfterCloseRef={openConfirmationDialogButtonRef}
    >
      <Dialog.Header
        id={titleId}
        title={title}
        iconLeft={<IconQuestionCircle aria-hidden="true" />}
      />
      <Dialog.Content>
        <p id={descriptionId} className="text-body">
          {description}
        </p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={proceed as (value: unknown) => void}>{t('proceed')}</Button>
        <Button onClick={cancel as (value: unknown) => void} variant="secondary">
          {t('cancel')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default ConfirmDialog;
