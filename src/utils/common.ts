import { IOptionType } from '@/interfaces/common';
import { EnumType } from 'typescript';
import i18n from '../i18n';

export const matchExact = (value: string) => new RegExp(value, 'i');

export const getOptionsFromEnum = (enums: any) => {
  const phaseOptions: Array<IOptionType> = [];
  Object.values(enums).map((p) => phaseOptions.push({ label: i18n.t(`enums.${p}`) }));
  return phaseOptions;
};
