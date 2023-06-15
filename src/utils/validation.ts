import { IOption } from '@/interfaces/common';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';
import { UseFormGetValues } from 'react-hook-form';
import _ from 'lodash';

export const validateMaxLength = (
  value: number,
  t: TFunction<'translation', undefined, 'translation'>,
) => ({
  maxLength: { value: value, message: t('validation.maxLength', { value: value }) },
});

export const validateRequired = (
  field: string,
  t: TFunction<'translation', undefined, 'translation'>,
) => ({
  required: t('validation.required', { field: t(`validation.${field}`) }) ?? '',
});

export const validateMaxNumber = (
  max: number,
  t: TFunction<'translation', undefined, 'translation'>,
) => ({
  min: {
    value: 0,
    message: t('validation.minValue', { value: '0' }),
  },
  max: {
    value: max,
    message: t('validation.maxValue', { value: max }),
  },
});

export const getFieldsIfEmpty = (
  fields: Array<string>,
  getValues: UseFormGetValues<IProjectForm>,
) =>
  fields.filter((f) => {
    if (_.has(getValues(f as keyof IProjectForm), 'value')) {
      return !(getValues(f as keyof IProjectForm) as IOption).value;
    } else {
      return !getValues(f as keyof IProjectForm);
    }
  });
