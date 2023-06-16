import { IOption } from '@/interfaces/common';
import { IProjectForm } from '@/interfaces/formInterfaces';
import { TFunction } from 'i18next';
import { UseFormGetValues } from 'react-hook-form';
import _ from 'lodash';
import { isBefore } from './dates';

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

export const validateBefore = (
  startDate: string | null,
  endDateField: string,
  getValues: UseFormGetValues<IProjectForm>,
  t: TFunction<'translation', undefined, 'translation'>,
) => {
  if (!isBefore(startDate, getValues(endDateField as keyof IProjectForm) as string)) {
    return t('validation.isBefore', {
      value: t(`validation.${endDateField}`),
    });
  }
  return true;
};

export const validateAfter = (
  endDate: string | null,
  startDateField: string,
  getValues: UseFormGetValues<IProjectForm>,
  t: TFunction<'translation', undefined, 'translation'>,
) => {
  if (!isBefore(getValues(startDateField as keyof IProjectForm) as string, endDate)) {
    return t('validation.isAfter', {
      value: t(`validation.${startDateField}`),
    });
  }
  return true;
};

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
