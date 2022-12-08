import { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import { IOption } from './common';

export enum FormField {
  Select,
  Text,
  Number,
  NetworkNumbers,
  TagsForm,
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
  sapProject: string;
  sapNetwork: Array<string>;
  hashTags: Array<string>;
}

export interface ISomeOtherForm {
  name: string;
  phone: number;
}

export type HookFormControlType =
  | Control<FieldValues>
  | Control<IProjectCardBasicsForm>
  | undefined;

export type HookFormRulesType = Omit<
  RegisterOptions<FieldValues, FieldPath<FieldValues>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;
