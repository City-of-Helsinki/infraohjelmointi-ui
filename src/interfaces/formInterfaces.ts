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
  icon?: string;
}

export interface IProjectHeaderForm {
  phase: IOption;
  favourite: boolean;
  name: string;
  address?: string;
}

export interface IProjectBasicsForm {
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
  constructionPhaseDetail: IOption;
  louhi: boolean;
  gravel: boolean;
  category: IOption;
  effectHousing: boolean;
  riskAssessment: IOption;
  constructionEndYear: string;
  planningStartYear: string;
}

export interface IProjectNoteForm {
  id: string;
  updatedBy: string;
  content: string;
  project: string;
}

export interface IAppForms extends IProjectHeaderForm, IProjectBasicsForm {}

export interface ISomeOtherForm {
  name: string;
  phone: number;
}

export type HookFormControlType =
  | Control<FieldValues>
  | Control<IProjectBasicsForm>
  | Control<IProjectHeaderForm>
  | undefined;

export type HookFormRulesType = Omit<
  RegisterOptions<FieldValues, FieldPath<FieldValues>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export type IFormValueType = string | boolean | IOption | string[] | undefined;
