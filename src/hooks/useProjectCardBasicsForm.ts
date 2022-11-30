import { FormField, HookFormControlType, IForm } from '@/interfaces/formInterfaces';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAppSelector } from './common';
import { RootState } from '@/store';
import { listItemToOption } from '@/utils/common';

/**
 * Creates form fields for the project card, in order for the labels to work the 'fi.json'-translations need
 * to have the same name as the field name.
 *
 * @param control react-hook-form control to add to the fields
 * @returns IProjectCard
 */
const getProjectBasicsFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): Array<IForm> => {
  const formFields = [
    {
      name: 'basicInfoTitle',
      type: FormField.Title,
    },
    {
      name: 'type',
      rules: { required: 'Hankkeen tyyppi on pakollinen tieto.' },
      type: FormField.Select,
    },
    {
      name: 'hkrId',
      readOnly: true,
      type: FormField.Text,
    },
    {
      name: 'entityName',
      type: FormField.Text,
      rules: { maxLength: { value: 30, message: 'Nimi voi olla enintään 30 merkkiä.' } },
    },
    {
      name: 'sapProject',
      readOnly: true,
      type: FormField.Text,
    },
    {
      name: 'description',
      rules: { required: 'Kuvaus on pakollinen tieto.' },
      type: FormField.Text,
    },
    {
      name: 'sapNetwork',
      type: FormField.NetworkNumbers,
    },
    {
      name: 'area',
      type: FormField.Select,
    },
    {
      name: 'hashTags',
      type: FormField.TagsForm,
    },
  ];

  const projectCardBasicsFormFields = formFields.map((ff) => ({
    ...ff,
    control: control,
    label: translate(`projectCardBasicsForm.${ff.name}`),
  }));

  return projectCardBasicsFormFields;
};

/**
 * Creates the memoized initial values for react-hook-form useForm()-hook. It also returns the
 * projectCard which can be needed to check for updates.
 *
 * @returns formValues, projectCard
 */
const useProjectCardBasicsValues = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  const { t } = useTranslation();
  const formValues: IProjectCardBasicsForm = useMemo(
    () => ({
      type: listItemToOption(projectCard?.type, t),
      description: projectCard?.description || '',
      area: listItemToOption(projectCard?.area, t),
      hkrId: projectCard?.hkrId || '',
      sapProject: projectCard?.sapProject || [],
      sapNetwork: projectCard?.sapNetwork || [],
      entityName: projectCard?.entityName || '',
      hashTags: projectCard?.hashTags || [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectCard],
  );

  return { formValues, projectCard };
};

/**
 * This hook initializes a react-hook-form control for a project card basics form. It will keep the
 * form up to date with the selectedProjectCard from redux and return all needed functions to handle
 * the form.
 *
 * It will also return formFields, which can be passed to the FormFieldCreator component to generate
 * the visual form.
 *
 * @param projectCard any ProjectCard
 * @returns handleSubmit, reset, formFields
 */
const useProjectCardBasicsForm = () => {
  const { t } = useTranslation();

  const { formValues, projectCard } = useProjectCardBasicsValues();

  const { control, handleSubmit, reset } = useForm<IProjectCardBasicsForm>({
    defaultValues: formValues,
  });

  // Updates
  useEffect(() => {
    if (projectCard) {
      reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCard, formValues]);

  const formFields = getProjectBasicsFormFields(control, t);

  return { handleSubmit, reset, formFields };
};

export default useProjectCardBasicsForm;
