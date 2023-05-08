import { IProjectHeaderForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import { listItemToOption } from '@/utils/common';
import { useTranslation } from 'react-i18next';
import { selectProject } from '@/reducers/projectSlice';
import { selectUser } from '@/reducers/authSlice';

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * project which can be needed to check for updates.
 *
 * @returns formValues, project
 */
const useProjectHeaderValues = () => {
  const project = useAppSelector(selectProject);
  const user = useAppSelector(selectUser);

  const { t } = useTranslation();

  const formValues = useMemo(
    () => ({
      favourite: (user && project?.favPersons?.includes(user.id)) || false,
      phase: listItemToOption(project?.phase, t) || [],
      name: project?.name ?? '',
      address: project?.address ?? '',
    }),
    [project, user],
  );

  return { formValues, project };
};

/**
 * This hook initializes a react-hook-form control for a project header form. It will keep the
 * form up to date with the selectedProject from redux and return all needed functions to handle
 * the form.
 *
 * @returns handleSubmit, control, dirtyFields
 */
const useProjectHeaderForm = () => {
  const { formValues, project } = useProjectHeaderValues();

  const formMethods = useForm<IProjectHeaderForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control, reset } = formMethods;

  // Updates
  useEffect(() => {
    if (project) {
      reset(formValues);
    }
  }, [project, formValues]);

  return { formMethods, control };
};

export default useProjectHeaderForm;
