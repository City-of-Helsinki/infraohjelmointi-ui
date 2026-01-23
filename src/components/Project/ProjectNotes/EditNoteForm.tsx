import { Button, ButtonVariant } from 'hds-react';
import { IconPenLine } from 'hds-react/icons';
import { FC, memo, useCallback } from 'react';
import { Dialog } from 'hds-react';
import { INote } from '@/interfaces/noteInterfaces';
import { Controller } from 'react-hook-form';
import { TextArea } from 'hds-react';
import { useTranslation } from 'react-i18next';
import useProjectNoteForm from '@/forms/useNoteForm';
import DialogWrapper from '@/components/shared/DialogWrapper';
import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { usePatchNoteMutation } from '@/api/notesApi';

interface IProjectEditNoteFormProps {
  isOpen: boolean;
  note: INote;
  close: () => void;
}

const ProjectEditNoteForm: FC<IProjectEditNoteFormProps> = ({ isOpen, close, note }) => {
  const { Content, ActionButtons } = Dialog;
  const { formMethods } = useProjectNoteForm(note);
  const { t } = useTranslation();
  const [patchNote] = usePatchNoteMutation();

  const { handleSubmit, control } = formMethods;

  const onSubmit = useCallback(
    async (form: IProjectNoteForm) => {
      await patchNote({ content: form.content, id: form.id });
      close();
    },
    [close, patchNote],
  );

  return (
    <DialogWrapper
      isOpen={isOpen}
      name="edit-note"
      title={t('editNote')}
      icon={<IconPenLine aria-hidden="true" />}
      size="l"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Content>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                id="textarea"
                label={t('writeNote')}
                data-testid="edit-note-textarea"
                required
              />
            )}
          />
        </Content>
        <ActionButtons>
          <Button type="submit" data-testid="edit-note-save">
            {t('save')}
          </Button>
          <Button onClick={close} variant={ButtonVariant.Secondary}>
            {t('cancel')}
          </Button>
        </ActionButtons>
      </form>
    </DialogWrapper>
  );
};

export default memo(ProjectEditNoteForm);
