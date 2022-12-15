import { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import { IOption } from './common';

export enum FormField {
  Select,
  Text,
  Number,
  TagsForm,
  Title,
  FieldSet,
  Date,
  RadioCheckbox,
  ListField,
  OverrunRight,
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
  tooltip?: string;
  hideLabel?: boolean;
}

export interface IProjectCardHeaderForm {
  phase: IOption;
  favourite: boolean;
  name: string;
  address?: string;
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
  phase: IOption;
  programmed: boolean;
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

export type IFormValueType = string | boolean | IOption | string[] | undefined;
