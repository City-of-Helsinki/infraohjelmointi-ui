import { useAppDispatch } from '@/hooks/common';
import useProjectNoteForm from '@/hooks/useNoteForm';
import { INoteRequest } from '@/interfaces/noteInterfaces';
import { postNoteThunk } from '@/reducers/noteSlice';
import { Button } from 'hds-react/components/Button';
import { TextArea } from 'hds-react/components/Textarea';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ProjectNewNoteForm = () => {
  const { formMethods, formValues } = useProjectNoteForm();
  const { t } = useTranslation();
  const { handleSubmit, control, reset } = formMethods;
  const dispatch = useAppDispatch();

  const onSubmit = async (form: INoteRequest) =>
    await dispatch(postNoteThunk(form)).then(() => reset(formValues));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="note-form-container">
        <div className="note-form-textarea">
          <Controller
            name="content"
            control={control}
            render={({ field }) => <TextArea {...field} id="textarea" label={t('writeNote')} />}
          />
        </div>
        <Button size="small" type="submit">
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export default ProjectNewNoteForm;
