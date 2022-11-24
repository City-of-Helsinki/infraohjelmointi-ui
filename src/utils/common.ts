import { IOptionType } from '@/interfaces/common';
// import i18n from '../i18n';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const getOptionsFromObject = (object: object): Array<IOptionType> => {
  // return Object.values(object).map((p) => ({ label: i18n.t(`enums.${p}`) }));
  return Object.values(object).map((p) => ({ label: `enums.${p}` }));
};
