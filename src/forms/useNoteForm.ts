import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import _ from 'lodash';
import { INote } from '@/interfaces/noteInterfaces';
import { selectProject } from '@/reducers/projectSlice';
import { selectUser } from '@/reducers/authSlice';

const useNoteValues = (note?: INote) => {
  const user = useAppSelector(selectUser, _.isEqual)?.id;
  const projectId = useAppSelector(selectProject, _.isEqual)?.id;

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
