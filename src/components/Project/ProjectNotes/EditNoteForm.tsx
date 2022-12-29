import { Button } from 'hds-react/components/Button';
import { IconPenLine } from 'hds-react/icons';
import { FC, memo } from 'react';
import { Dialog } from 'hds-react/components/Dialog';
import { useAppDispatch } from '@/hooks/common';
import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
import { Controller } from 'react-hook-form';
import { TextArea } from 'hds-react/components/Textarea';
import { useTranslation } from 'react-i18next';
import useProjectNoteForm from '@/hooks/useNoteForm';
import { patchNoteThunk } from '@/reducers/noteSlice';
import DialogWrapper from '@/components/shared/DialogWrapper';

interface IProjectEditNoteFormProps {
  isOpen: boolean;
  note: INote;
  close: () => void;
}

const ProjectEditNoteForm: FC<IProjectEditNoteFormProps> = ({ isOpen, close, note }) => {
  const { Content, ActionButtons } = Dialog;
  const { formMethods } = useProjectNoteForm(note);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { handleSubmit, control } = formMethods;

  const onSubmit = (form: INoteRequest) => {
    dispatch(patchNoteThunk(form));
    close();
  };

  return (
    <DialogWrapper
      isOpen={isOpen}
      name="modify-note"
      title={t('modifyNote')}
      icon={<IconPenLine aria-hidden="true" />}
      size="l"
    >
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
    </DialogWrapper>
  );
};

export default memo(ProjectEditNoteForm);