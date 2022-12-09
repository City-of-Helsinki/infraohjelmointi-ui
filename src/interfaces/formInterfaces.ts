import { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import { IOption } from './common';

export enum FormField {
  Select,
  Text,
  Number,
  NetworkNumbers,
  TagsForm,
  Title,
  FieldSet,
  Date,
  Multi,
}

export interface IForm {
  name: string;
  label: string;
  control: HookFormControlType;
  type?: FormField;
  rules?: HookFormRulesType;
  required?: boolean;
  readOnly?: boolean;
  fieldSet?: Array<IForm>;
  dateFormat?: string;
}

export interface IProjectCardHeaderForm {
  phase: IOption;
  favourite: boolean;
  name: string;
  address?: string;
  group: string;
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

export interface IAppForms extends IProjectCardHeaderForm, IProjectCardBasicsForm {}

export interface ISomeOtherForm {
  name: string;
  phone: number;
}

export type HookFormControlType =
  | Control<FieldValues>
  | Control<IProjectCardBasicsForm>
  | Control<IProjectCardHeaderForm>
  | undefined;

export type HookFormRulesType = Omit<
  RegisterOptions<FieldValues, FieldPath<FieldValues>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;
