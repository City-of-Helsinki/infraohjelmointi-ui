import { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import { IOption } from './common';

export enum FormField {
  Select,
  Text,
  NetworkNumbers,
  HashTags,
  Title,
}

export interface IForm {
  name: string;
  label: string;
  control: HookFormControlType;
  type: FormField;
  rules?: HookFormRulesType;
  required?: boolean;
  readOnly?: boolean;
}

export interface IProjectCardBasicsForm {
  type: IOption;
  entityName: string;
  description: string;
  area: IOption;
  hkrId: string;
  sapProject: Array<string>;
  sapNetwork: Array<string>;
  hashTags: Array<string>;
}

export type HookFormControlType =
  | Control<FieldValues>
  | Control<IProjectCardBasicsForm>
  | undefined;

export type HookFormRulesType = Omit<
  RegisterOptions<FieldValues, FieldPath<FieldValues>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;
