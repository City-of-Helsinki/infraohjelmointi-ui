import { Button, ButtonPresetTheme, ButtonVariant } from 'hds-react';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';
import { FC, memo, useCallback } from 'react';
import { Dialog } from 'hds-react';
import { useTranslation } from 'react-i18next';
import DialogWrapper from '@/components/shared/DialogWrapper';
import { useDeleteNoteMutation } from '@/api/notesApi';

interface IProjectDeleteNoteFormProps {
  isOpen: boolean;
  noteId: string;
  close: () => void;
}

const ProjectDeleteNoteForm: FC<IProjectDeleteNoteFormProps> = ({ isOpen, close, noteId }) => {
  const { Content, ActionButtons } = Dialog;
  const { t } = useTranslation();
  const [deleteNote] = useDeleteNoteMutation();

  const handleDeleteNote = useCallback(async () => {
    try {
      await deleteNote(noteId);
      close();
    } catch (e) {
      console.log('Error deleting note: ', e);
    }
  }, [close, noteId, deleteNote]);

  return (
    <DialogWrapper
      isOpen={isOpen}
      name="delete-note"
      title={t('deleteNoteConfirm')}
      icon={<IconAlertCircle aria-hidden="true" />}
      variant="danger"
    >
      <Content>
        <p>{t('deleteNoteInfo')}</p>
      </Content>
      <ActionButtons>
        <Button onClick={close} theme={ButtonPresetTheme.Black} variant={ButtonVariant.Secondary}>
          {t('cancel')}
        </Button>
        <Button
          variant={ButtonVariant.Danger}
          iconStart={<IconTrash aria-hidden="true" />}
          onClick={handleDeleteNote}
        >
          {t('deleteNote')}
        </Button>
      </ActionButtons>
    </DialogWrapper>
  );
};

export default memo(ProjectDeleteNoteForm);
