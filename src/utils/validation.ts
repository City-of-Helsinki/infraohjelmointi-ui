import { IError, IOption } from '@/interfaces/common';
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

/**
 * Looks through a given error object's errors list for a given attribute
 * and returns a translated error text if that attribute if found within the errors list.
 *
 * @param attribute an attribute/key to look for in the errors
 * @param error an IError object
 * @param translate
 * @returns
 */
export const getErrorText = (
  attribute: string,
  error: IError,
  translate: TFunction<'translation', undefined>,
) => {
  if (error?.errors && error?.errors?.length > 0) {
    for (const e of error.errors) {
      if (e.attr === attribute) {
        return translate(`error.${e.code}`);
      }
    }
  } else {
    return '';
  }
};
