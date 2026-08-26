import useProjectNoteForm from '@/forms/useNoteForm';
import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { INoteRequest } from '@/interfaces/noteInterfaces';
import { Button, ButtonSize } from 'hds-react';
import { TextArea } from 'hds-react';
import { memo, useCallback, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePostNoteMutation } from '@/api/notesApi';
import NoteFileInput from './NoteFileInput';
import usePostNoteImages from './usePostNoteImages';

const ProjectNewNoteForm = () => {
  const { formMethods, formValues } = useProjectNoteForm();
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = formMethods;
  const [postNote] = usePostNoteMutation();
  const [files, setFiles] = useState<File[] | null>(null);
  const { postImages, isPostingNoteImage } = usePostNoteImages();

  const onSubmit = useCallback(
    async (form: IProjectNoteForm) => {
      try {
        const note = await postNote(form as INoteRequest).unwrap();
        await postImages(note.id, files);
        reset(formValues);
        setFiles(null);
      } catch (e) {
        console.log('Error posting note: ', e);
      }
    },
    [formValues, reset, postNote, postImages, files],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="new-note-form-container">
        <div className="mb-6 w-full" data-testid="new-note-textarea">
          <Controller
            name="content"
            control={control}
            render={({ field }) => <TextArea {...field} id="textarea" label={t('writeNote')} />}
          />
        </div>
        {isPostingNoteImage ? null : <NoteFileInput handleChange={setFiles} />}
        <Button size={ButtonSize.Small} type="submit" disabled={!isDirty}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export default memo(ProjectNewNoteForm);
