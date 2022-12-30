import { Button } from 'hds-react/components/Button';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';
import { FC, memo } from 'react';
import { Dialog } from 'hds-react/components/Dialog';
import { useAppDispatch } from '@/hooks/common';
import { deleteNoteThunk } from '@/reducers/noteSlice';
import { useTranslation } from 'react-i18next';
import DialogWrapper from '@/components/shared/DialogWrapper';

interface IProjectDeleteNoteFormProps {
  isOpen: boolean;
  noteId: string;
  close: () => void;
}

const ProjectDeleteNoteForm: FC<IProjectDeleteNoteFormProps> = ({ isOpen, close, noteId }) => {
  const { Content, ActionButtons } = Dialog;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleDeleteNote = () => {
    console.log('Deleting note with ID: ', noteId);
    dispatch(deleteNoteThunk(noteId));
    close();
  };

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
        <Button onClick={close} theme="black" variant="secondary">
          {t('cancel')}
        </Button>
        <Button
          variant="danger"
          iconLeft={<IconTrash aria-hidden="true" />}
          onClick={handleDeleteNote}
        >
          {t('deleteNote')}
        </Button>
      </ActionButtons>
    </DialogWrapper>
  );
};

export default memo(ProjectDeleteNoteForm);
