import { IProjectHeaderForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '../hooks/common';
import { listItemToOption } from '@/utils/common';
import { selectUser } from '@/reducers/authSlice';
import { usePostalCode } from '@/hooks/usePostalCode';
import { IProject } from '@/interfaces/projectInterfaces';

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook.
 *
 * @returns formValues, project
 */
const useProjectHeaderValues = (selectedProject: IProject | null) => {
  const user = useAppSelector(selectUser);

  const formValues = useMemo(
    () => ({
      favourite: (user && selectedProject?.favPersons?.includes(user.uuid)) ?? false,
      phase: listItemToOption(selectedProject?.phase) ?? [],
      name: selectedProject?.name ?? '',
      address: selectedProject?.address ?? '',
      postalCode: selectedProject?.postalCode ?? '',
      city: selectedProject?.city ?? '',
    }),
    [selectedProject, user],
  );

  return formValues;
};

/**
 * This hook initializes a react-hook-form control for a project header form. It returns
 * all needed functions to handle the form.
 *
 * @returns handleSubmit, control, dirtyFields
 */
const useProjectHeaderForm = (project: IProject | null) => {
  const formValues = useProjectHeaderValues(project);

  const formMethods = useForm<IProjectHeaderForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control, reset, watch, setValue } = formMethods;

  // Updates form when the project changes
  useEffect(() => {
    if (project) {
      reset(formValues);
    }
  }, [project, formValues, reset]);

  const address = watch('address');
  const { postalCode, city } = usePostalCode(address || '');
  useEffect(() => {
    setValue('postalCode', postalCode, { shouldDirty: !!postalCode });
    setValue('city', city, { shouldDirty: !!city });
  }, [postalCode, city, setValue]);

  return { formMethods, control };
};

export default useProjectHeaderForm;
