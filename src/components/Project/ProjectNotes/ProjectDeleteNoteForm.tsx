import { Button } from 'hds-react/components/Button';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';
import { FC, memo } from 'react';
import { Dialog } from 'hds-react/components/Dialog';
import { useAppDispatch } from '@/hooks/common';
import { deleteNoteThunk } from '@/reducers/noteSlice';
import { useTranslation } from 'react-i18next';

interface IProjectDeleteNoteFormProps {
  isOpen: boolean;
  noteId: string;
  close: () => void;
}

const ProjectDeleteNoteForm: FC<IProjectDeleteNoteFormProps> = ({ isOpen, close, noteId }) => {
  const { Header, Content, ActionButtons } = Dialog;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleDeleteNote = () => {
    // TODO: delete should return an id to filter out the old with
    dispatch(deleteNoteThunk(noteId));
    close();
  };

  return (
    <Dialog
      id="delete-note-dialog"
      aria-labelledby="delete-note-dialog"
      isOpen={isOpen}
      variant="danger"
    >
      <Header
        id="delete-note-dialog-header"
        title={t('deleteNoteConfirm')}
        iconLeft={<IconAlertCircle aria-hidden="true" />}
      />
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
    </Dialog>
  );
};

export default memo(ProjectDeleteNoteForm);
