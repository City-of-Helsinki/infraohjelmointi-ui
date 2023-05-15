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
  const selectedProject = useAppSelector(selectProject);
  const user = useAppSelector(selectUser);

  const { t } = useTranslation();

  const formValues = useMemo(
    () => ({
      favourite: (user && selectedProject?.favPersons?.includes(user.id)) ?? false,
      phase: listItemToOption(selectedProject?.phase, t) ?? [],
      name: selectedProject?.name ?? '',
      address: selectedProject?.address ?? '',
    }),
    [selectedProject, user],
  );

  return { formValues, selectedProject };
};

/**
 * This hook initializes a react-hook-form control for a project header form. It will keep the
 * form up to date with the selectedProject from redux and return all needed functions to handle
 * the form.
 *
 * @returns handleSubmit, control, dirtyFields
 */
const useProjectHeaderForm = () => {
  const { formValues, selectedProject } = useProjectHeaderValues();

  const formMethods = useForm<IProjectHeaderForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control, reset } = formMethods;

  // Updates form when the selectedProject changes in redux
  useEffect(() => {
    if (selectedProject) {
      reset(formValues);
    }
  }, [selectedProject, formValues]);

  return { formMethods, control };
};

export default useProjectHeaderForm;
