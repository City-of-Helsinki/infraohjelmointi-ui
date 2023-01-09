import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { RootState } from '@/store';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from './common';
import _ from 'lodash';
import { INote } from '@/interfaces/noteInterfaces';

const useNoteValues = (note?: INote) => {
  const user = useAppSelector((state: RootState) => state.auth.user?.id, _.isEqual);
  const projectId = useAppSelector(
    (state: RootState) => state.project.selectedProject?.id,
    _.isEqual,
  );

  const formValues = useMemo(
    () => ({
      id: note?.id || '',
      updatedBy: user || '',
      content: note?.content || '',
      project: projectId || '',
    }),
    [projectId, user, note],
  );
  return { formValues, projectId, user };
};

const useProjectNoteForm = (note?: INote) => {
  const { formValues, projectId, user } = useNoteValues(note);

  const formMethods = useForm<IProjectNoteForm>({
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
  }, [projectId, formValues, user]);

  return { formMethods, formValues };
};

export default useProjectNoteForm;
