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
    {
      name: 'searchWord',
      type: FormField.Text,
      tooltip: 'Etsi hakusanalla, esim. nimen, ryhmän, hashtagin mukaan',
    },
    {
      name: 'masterClass',
      type: FormField.Text,
    },
    {
      name: 'class',
      type: FormField.Text,
    },
    {
      name: 'subClass',
      type: FormField.Text,
    },
    {
      name: 'category',
      type: FormField.Text,
    },
    {
      name: 'personPlanning',
      type: FormField.Text,
    },
  ];

  const projectBasicsFormFields = formFields.map((formField) => ({
    ...formField,
    control,
    label: translate(`searchForm.${formField.name}`),
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
    programmed: false,
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
