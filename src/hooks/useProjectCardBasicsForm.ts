import { FormField, HookFormControlType, IForm } from '@/interfaces/formInterfaces';
import { ProjectType } from '@/interfaces/projectCardInterfaces';
import { getOptionsFromEnum } from '@/utils/common';
import { IProjectCardBasicsForm } from '@/interfaces/formInterfaces';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import i18n from '@/i18n';

/**
 * Creates form fields for the project card, in order for the labels to work the 'fi.json'-translations need
 * to have the same name as the field name.
 *
 * @param control react-hook-form control to add to the fields
 * @returns IProjectCard
 */
const getProjectBasicsFormFields = (control: HookFormControlType): Array<Array<IForm>> => {
  const formFields = [
    [
      {
        name: 'type',
        options: getOptionsFromEnum(ProjectType),
        rules: { required: 'Hankkeen tyyppi on pakollinen tieto' },
        type: FormField.Select,
      },
      {
        name: 'entityName',
        type: FormField.Text,
      },
      {
        name: 'description',
        rules: { required: 'Kuvaus on pakollinen tieto' },
        type: FormField.Text,
      },
      {
        name: 'area',
        // TODO: we don't have the correct enums for area yet
        options: [{ label: 'TestArea1' }, { label: 'TestArea2' }],
        type: FormField.Select,
      },
    ],
    [
      {
        name: 'hkrId',
        readOnly: true,
        type: FormField.Text,
      },
      {
        name: 'sapProject',
        readOnly: true,
        type: FormField.Text,
      },
    ],
  ];

  const projectCardBasicsForm = formFields.map((pbff) =>
    pbff.map((obj) => ({
      ...obj,
      control: control,
      label: i18n.t(`projectCardBasicsForm.${obj.name}`),
    })),
  );

  return projectCardBasicsForm;
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
  const defaultFormValues = useMemo(
    () => ({
      type: projectCard?.type || '',
      description: projectCard?.description || '',
      area: projectCard?.area?.areaName || '',
      hkrId: projectCard?.hkrId || '',
      sapProject: projectCard?.sapProject || '',
      sapNetwork: projectCard?.sapNetwork || '',
      entityName: '',
    }),
    [projectCard],
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

  const formFields = getProjectBasicsFormFields(control);

  return { control, handleSubmit, reset, formFields };
};

export default useProjectCardBasicsForm;
