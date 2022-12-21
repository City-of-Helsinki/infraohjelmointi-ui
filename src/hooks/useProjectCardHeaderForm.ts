import { IProjectCardHeaderForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from './common';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * projectCard which can be needed to check for updates.
 *
 * @returns formValues, projectCard
 */
const useProjectCardHeaderValues = () => {
  const projectCard = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard,
    _.isEqual,
  );
  const user = useAppSelector((state: RootState) => state.auth.user, _.isEqual);

  const { t } = useTranslation();

  const formValues = useMemo(
    () => ({
      favourite: (user && projectCard?.favPersons?.includes(user.id)) || false,
      phase: listItemToOption(projectCard?.phase, t) || [],
      name: projectCard?.name || '',
      address: projectCard?.address || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectCard, user],
  );

  return { formValues, projectCard };
};

/**
 * This hook initializes a react-hook-form control for a project card header form. It will keep the
 * form up to date with the selectedProjectCard from redux and return all needed functions to handle
 * the form.
 *
 * @returns handleSubmit, control, dirtyFields
 */
const useProjectCardHeaderForm = () => {
  const { formValues, projectCard } = useProjectCardHeaderValues();

  const { control, handleSubmit, reset, formState } = useForm<IProjectCardHeaderForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'all',
  });

  const { dirtyFields } = formState;

  // Updates
  useEffect(() => {
    if (projectCard) {
      reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCard, formValues]);

  return { handleSubmit, control, dirtyFields };
};

export default useProjectCardHeaderForm;
