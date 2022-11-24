import { IOption } from '@/interfaces/common';
import { TFunction } from 'i18next';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const getOptionsFromObject = (
  object: object,
  translate: TFunction<'translation', undefined>,
): Array<IOption> => {
  return Object.values(object).map((p) => ({ label: translate(`enums.${p}`), value: '' }));
};
