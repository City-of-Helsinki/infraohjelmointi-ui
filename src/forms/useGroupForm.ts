import { FormField, HookFormControlType, IForm, IGroupForm } from '@/interfaces/formInterfaces';

import { useForm, UseFormGetValues } from 'react-hook-form';

import { t, TFunction } from 'i18next';
import { useMemo } from 'react';

const useGroupValues = () => {
  const formValues = useMemo(
    () => ({
      name: '',
      masterClass: {},
      class: {},
      subClass: {},
      district: {},
      division: {},
      subDivision: {},
    }),
    [],
  );
  return { formValues };
};

const useGroupForm = () => {
  const { formValues } = useGroupValues();

  const formMethods = useForm<IGroupForm>({
    defaultValues: useMemo(() => formValues, [formValues]),
    mode: 'onBlur',
  });

  const { control } = formMethods;

  return { formMethods, formValues };
};

export default useGroupForm;
