import { FormField, HookFormControlType, IForm, ISearchForm } from '@/interfaces/formInterfaces';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAppSelector } from './common';
import { RootState } from '@/store';

const buildSearchFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): Array<IForm> => {
  const formFields = [
    {
      name: 'filter',
      type: FormField.ListField,
      readOnly: true,
    },
    {
      name: 'masterClass',
      type: FormField.MultiSelect,
      placeholder: 'Valitse',
    },
    {
      name: 'class',
      type: FormField.MultiSelect,
      placeholder: 'Valitse',
    },
    {
      name: 'subClass',
      type: FormField.MultiSelect,
      placeholder: 'Valitse',
    },
    {
      name: 'programmed',
      type: FormField.FieldSet,
      fieldSet: [
        { name: 'programmedYes', type: FormField.Checkbox },
        { name: 'programmedNo', type: FormField.Checkbox },
      ],
    },
    {
      name: 'responsiblePersons',
      type: FormField.Select,
      icon: 'person',
      placeholder: 'Valitse',
    },
    { name: 'district', type: FormField.Select, placeholder: 'Valitse', icon: 'location' },
    { name: 'division', type: FormField.Select, placeholder: 'Valitse', icon: 'location' },
    { name: 'subDivision', type: FormField.Select, placeholder: 'Valitse', icon: 'location' },
    {
      name: 'category',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
  ];

  const projectBasicsFormFields = formFields.map((formField) => ({
    ...formField,
    control,
    label: translate(`searchForm.${formField.name}`),
    fieldSet: formField.fieldSet?.map((fieldSetField) => ({
      ...fieldSetField,
      control,
      label: translate(`searchForm.${fieldSetField.name}`),
    })),
  }));

  return projectBasicsFormFields;
};

const useSearchForm = () => {
  const { t } = useTranslation();

  const formValues = useAppSelector((state: RootState) => state.search.form);

  const formMethods = useForm<ISearchForm>({
    defaultValues: formValues,
    mode: 'onBlur',
  });

  const { control, reset } = formMethods;

  useEffect(() => {
    reset(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formFields = useMemo(() => buildSearchFormFields(control, t), [control]);

  return { formFields, formMethods };
};

export default useSearchForm;
