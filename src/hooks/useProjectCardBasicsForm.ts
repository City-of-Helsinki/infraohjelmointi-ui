import { FormField, HookFormControlType, IForm } from '@/interfaces/formInterfaces';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useOptions } from './useOptions';
import { IListItem, IOption } from '@/interfaces/common';

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
      rules: { required: 'Hankkeen tyyppi on pakollinen tieto' },
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
    },
    {
      name: 'sapProject',
      readOnly: true,
      type: FormField.Text,
    },
    {
      name: 'description',
      rules: { required: 'Kuvaus on pakollinen tieto' },
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
      type: FormField.HashTags,
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
 * This hook initializes a react-hook-form control using an optional projectCard parameter to map the values.
 *
 * It will keep the form up to date with the given projectCard if it changes.
 *
 * @param projectCard any ProjectCard
 * @returns control, handleSubmit, reset
 */
export const useProjectCardBasicsForm = (projectCard?: IProjectCard | null) => {
  const { t } = useTranslation();
  const { getOptionFromListItem } = useOptions();

  const defaultFormValues: IProjectCardBasicsForm = useMemo(
    () => ({
      type: getOptionFromListItem(projectCard?.type),
      description: projectCard?.description || '',
      area: getOptionFromListItem(projectCard?.area),
      hkrId: projectCard?.hkrId || '',
      sapProject: projectCard?.sapProject || [''],
      sapNetwork: projectCard?.sapNetwork || [''],
      entityName: projectCard?.entityName || '',
      hashTags: projectCard?.hashTags || [''],
    }),
    [projectCard, getOptionFromListItem],
  );

  const { control, handleSubmit, reset } = useForm<IProjectCardBasicsForm>({
    defaultValues: defaultFormValues,
  });

  useEffect(
    function updateFormFieldsOnProjectCardChange() {
      if (projectCard) {
        reset(defaultFormValues);
      }
    },
    [projectCard, defaultFormValues, reset],
  );

  const formFields = getProjectBasicsFormFields(control, t);

  return { control, handleSubmit, reset, formFields };
};

export default useProjectCardBasicsForm;
