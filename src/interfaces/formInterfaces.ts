import { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import { IOptionType } from './common';

export enum FormField {
  Select,
  Text,
  NetworkNumbers,
  Identifiers,
  Title,
}

export interface IForm {
  name: string;
  label: string;
  control: HookFormControlType;
  type: FormField;
  rules?: HookFormRulesType;
  options?: Array<IOptionType>;
  required?: boolean;
  readOnly?: boolean;
}

export interface IProjectCardBasicsForm {
  type: string;
  entityName: string;
  description: string;
  area: string;
  hkrId: string;
  sapProject: string;
  sapNetwork: string;
  networkNumbers: [];
  identifiers: [];
}

export type HookFormControlType =
  | Control<FieldValues>
  | Control<IProjectCardBasicsForm>
  | undefined;

export type HookFormRulesType = Omit<
  RegisterOptions<FieldValues, FieldPath<FieldValues>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;
