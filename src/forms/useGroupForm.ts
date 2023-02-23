import { FormField, HookFormControlType, IForm, IGroupForm } from '@/interfaces/formInterfaces';

import { useForm, UseFormGetValues } from 'react-hook-form';

import { t, TFunction } from 'i18next';
import { useMemo } from 'react';
import { IOption } from '@/interfaces/common';
interface IGroupFormFieldsSplit {
  basic: Array<IForm>;
  advance: Array<IForm>;
}

const buildGroupFormFields = (
  control: HookFormControlType,
  translate: TFunction<'translation', undefined>,
): IGroupFormFieldsSplit => {
  const formFields = {
    basic: [
      {
        name: 'name',
        type: FormField.Text,
        rules: { required: t(`fieldRequiredWarning`) },
      },
      {
        name: 'masterClass',
        type: FormField.Select,
        placeholder: 'Valitse',
        rules: {
          required: t(`fieldRequiredWarning`),
          validate: {
            isPopulated: (mc: IOption) =>
              Object.keys(mc).includes('value') && mc.value !== ''
                ? true
                : t(`fieldRequiredWarning`),
          },
        },
      },
      {
        name: 'class',
        type: FormField.Select,
        placeholder: 'Valitse',
        rules: {
          required: t(`fieldRequiredWarning`),
          validate: {
            isPopulated: (c: IOption) =>
              Object.keys(c).includes('value') && c.value !== '' ? true : t(`fieldRequiredWarning`),
          },
        },
      },
      {
        name: 'subClass',
        type: FormField.Select,
        placeholder: 'Valitse',
      },
    ],
    advance: [
      {
        name: 'district',
        type: FormField.Select,
        placeholder: 'Valitse',

        rules: {
          validate: {
            isPopulated: (d: IOption) =>
              Object.keys(d).includes('value') && d.value !== '' ? true : t(`fieldRequiredWarning`),
          },
        },
      },
      {
        name: 'division',
        type: FormField.Select,
        placeholder: 'Valitse',
        rules: {
          validate: {
            isPopulated: (d: IOption) =>
              Object.keys(d).includes('value') && d.value !== '' ? true : t(`fieldRequiredWarning`),
          },
        },
      },
      {
        name: 'subDivision',
        type: FormField.Select,
        placeholder: 'Valitse',
      },
    ],
  };

  const basicFields = formFields.basic.map((formField) => ({
    ...formField,
    control,
    label: translate(`groupForm.${formField.name}`),
  }));
  const advanceFields = formFields.advance.map((formField) => ({
    ...formField,
    control,
    label: translate(`groupForm.${formField.name}`),
  }));

  const groupFormFields = { basic: basicFields, advance: advanceFields };
  return groupFormFields;
};

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
  const formFields = useMemo(() => buildGroupFormFields(control, t), [control]);

  return { formMethods, formValues, formFields };
};

export default useGroupForm;
