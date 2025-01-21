import { useAppDispatch } from '@/hooks/common';
import useProjectNoteForm from '@/forms/useNoteForm';
import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { INoteRequest } from '@/interfaces/noteInterfaces';
import { postNoteThunk } from '@/reducers/noteSlice';
import { Button, ButtonSize } from 'hds-react/components/Button';
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
    async (form: IProjectNoteForm) => {
      try {
        await dispatch(postNoteThunk(form as INoteRequest));
        reset(formValues);
      } catch (e) {
        console.log('Error posting note: ', e);
      }
    },
    [dispatch, formValues, reset],
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
        <Button size={ButtonSize.Small} type="submit" disabled={!isDirty}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export default memo(ProjectNewNoteForm);
