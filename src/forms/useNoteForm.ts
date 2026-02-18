import { IProjectNoteForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import { INote } from '@/interfaces/noteInterfaces';
import { selectProject } from '@/reducers/projectSlice';
import { selectUser } from '@/reducers/authSlice';

const useNoteValues = (note?: INote) => {
  const userId = useAppSelector(selectUser)?.uuid;
  const projectId = useAppSelector(selectProject)?.id;

  const formValues = useMemo(
    () => ({
      id: note?.id ?? '',
      updatedBy: userId ?? '',
      content: note?.content ?? '',
      project: projectId ?? '',
    }),
    [projectId, userId, note],
  );
  return { formValues, projectId, userId };
};

const useProjectNoteForm = (note?: INote) => {
  const { formValues, projectId, userId } = useNoteValues(note);

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
  }, [projectId, formValues, userId, reset]);

  return { formMethods, formValues };
};

export default useProjectNoteForm;
