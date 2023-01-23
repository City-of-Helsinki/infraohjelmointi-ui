import { FormField, HookFormControlType, IForm, ISearchForm } from '@/interfaces/formInterfaces';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const buildSearchFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): Array<IForm> => {
  const formFields = [
    { name: 'filter', type: FormField.ListField, readOnly: true },
    {
      name: 'masterClass',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
    {
      name: 'class',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
    {
      name: 'subClass',
      type: FormField.Select,
      placeholder: 'Valitse',
    },
    {
      name: 'category',
      type: FormField.Select,
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
      name: 'personPlanning',
      type: FormField.Text,
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

  const formValues: ISearchForm = {
    searchWord: '',
    masterClass: '',
    Class: '',
    subClass: '',
    category: '',
    programmedYes: false,
    programmedNo: false,
    personPlanning: '',
  };

  const formMethods = useForm<ISearchForm>({
    defaultValues: formValues,
    mode: 'onBlur',
  });

  const { control } = formMethods;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formFields = useMemo(() => buildSearchFormFields(control, t), [control]);

  return { formFields, formMethods };
};

export default useSearchForm;
