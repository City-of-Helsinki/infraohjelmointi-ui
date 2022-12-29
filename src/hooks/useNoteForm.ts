import { IProjectCardNoteForm } from '@/interfaces/formInterfaces';
import { RootState } from '@/store';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from './common';
import _ from 'lodash';
import { INote } from '@/interfaces/noteInterfaces';

const useNoteValues = (note?: INote) => {
  const userId = useAppSelector((state: RootState) => state.auth.user?.id, _.isEqual);
  const projectId = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard?.id,
    _.isEqual,
  );

  const formValues = useMemo(
    () => ({
      id: note?.id || '',
      updatedBy: userId || '',
      content: note?.content || '',
      project: projectId || '',
    }),
    [projectId, userId, note],
  );
  return { formValues, projectId, userId };
};

const useProjectCardNoteForm = (note?: INote) => {
  const { formValues, projectId, userId } = useNoteValues(note);

  const formMethods = useForm<IProjectCardNoteForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { reset } = formMethods;

  // Updates
  useEffect(() => {
    if (projectId) {
      reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, formValues, userId]);

  return { formMethods, formValues };
};

export default useProjectCardNoteForm;
