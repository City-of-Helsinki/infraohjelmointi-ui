import { useAppDispatch } from '@/hooks/common';
import useProjectNoteForm from '@/forms/useNoteForm';
import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { INoteRequest } from '@/interfaces/noteInterfaces';
import { postNoteThunk } from '@/reducers/noteSlice';
import { Button } from 'hds-react/components/Button';
import { TextArea } from 'hds-react/components/Textarea';
import { memo, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ProjectNewNoteForm = () => {
  const { formMethods, formValues } = useProjectNoteForm();
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = formMethods;
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    async (form: IProjectNoteForm) =>
      await dispatch(postNoteThunk(form as INoteRequest)).then(() => reset(formValues)),
    [dispatch, formValues, reset],
  );

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
        <Button size="small" type="submit" disabled={!isDirty}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export default memo(ProjectNewNoteForm);
