import { Button } from 'hds-react/components/Button';
import { IconPenLine } from 'hds-react/icons';
import { FC, memo } from 'react';
import { Dialog } from 'hds-react/components/Dialog';
import { useAppDispatch } from '@/hooks/common';
import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
import { Controller } from 'react-hook-form';
import { TextArea } from 'hds-react/components/Textarea';
import { useTranslation } from 'react-i18next';
import useProjectCardNoteForm from '@/hooks/useNoteForm';
import { patchNoteThunk } from '@/reducers/noteSlice';

interface IProjectCardEditNoteFormProps {
  isOpen: boolean;
  note: INote;
  close: () => void;
}

const ProjectCardEditNoteForm: FC<IProjectCardEditNoteFormProps> = ({ isOpen, close, note }) => {
  const { Header, Content, ActionButtons } = Dialog;
  const { formMethods } = useProjectCardNoteForm(note);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { handleSubmit, control } = formMethods;

  const onSubmit = (form: INoteRequest) => {
    dispatch(patchNoteThunk(form));
    close();
  };

  return (
    <Dialog
      id="modify-note-dialog"
      aria-labelledby="modify-note-dialog"
      isOpen={isOpen}
      className="big-dialog"
    >
      <Header
        id="modify-note-dialog-header"
        title={t('modifyNote')}
        iconLeft={<IconPenLine aria-hidden="true" />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Content>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextArea {...field} id="textarea" label={t('writeNote')} required />
            )}
          />
        </Content>
        <ActionButtons>
          <Button type="submit">{t('save')}</Button>
          <Button onClick={close} variant="secondary">
            {t('cancel')}
          </Button>
        </ActionButtons>
      </form>
    </Dialog>
  );
};

export default memo(ProjectCardEditNoteForm);
