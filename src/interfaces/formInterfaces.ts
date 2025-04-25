import { Control, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';
import { FreeSearchFormObject, IOption } from './common';
import { IProjectSapCost } from './sapCostsInterfaces';

export enum FormField {
  Select,
  Text,
  Number,
  HashTagsForm,
  Title,
  FieldSet,
  Date,
  RadioCheckbox,
  ListField,
  OverrunRight,
  TextArea,
  Checkbox,
  MultiSelect,
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
  placeholder?: string;
  sapCosts?: IProjectSapCost | null;
  isSapProject?: boolean;
  sapCurrentYear?: IProjectSapCost | null;
}

export interface IProjectHeaderForm {
  phase: IOption;
  favourite: boolean;
  name: string;
  address?: string;
}

export interface IProjectForm {
  type: IOption;
  entityName: string;
  description: string;
  area: IOption;
  hkrId: string;
  sapProject: string;
  sapNetwork: string;
  hashTags: Array<string>;
  phase: IOption;
  programmed: boolean;
  constructionPhaseDetail: IOption;
  costForecast: string;
  louhi: boolean;
  gravel: boolean;
  category: IOption;
  effectHousing: boolean;
  riskAssessment: IOption;
  constructionEndYear: string;
  planningStartYear: string;
  estPlanningStart: string;
  estPlanningEnd: string;
  presenceStart: string;
  presenceEnd: string;
  visibilityStart: string;
  visibilityEnd: string;
  estConstructionStart: string;
  estConstructionEnd: string;
  estWarrantyPhaseStart: string;
  estWarrantyPhaseEnd: string;
  personConstruction: IOption;
  personPlanning: IOption;
  name: string;
  masterClass: IOption;
  class: IOption;
  subClass: IOption;
  district: IOption;
  division: IOption;
  subDivision: IOption;
  budgetOverrunReason: IOption;
  otherBudgetOverrunReason: string;
}

export interface ISearchForm {
  freeSearchParams: FreeSearchFormObject | object;
  masterClass: Array<IOption>;
  class: Array<IOption>;
  subClass: Array<IOption>;
  programmedYes: boolean;
  programmedNo: boolean;
  hkrIds: Array<string>
  personPlanning: IOption;
  personConstruction: IOption;
  programmedYearMin: IOption;
  programmedYearMax: IOption;
  phase: IOption;
  responsiblePerson: IOption;
  district: Array<IOption>;
  division: Array<IOption>;
  subDivision: Array<IOption>;
  category: IOption;
}

export interface IProjectNoteForm {
  id: string;
  updatedBy: string;
  content: string;
  project: string;
}

export interface IGroupForm {
  name: string;
  masterClass: IOption;
  class: IOption;
  subClass: IOption;
  district: IOption;
  division: IOption;
  subDivision: IOption;
  projectsForSubmit: Array<IOption>;
}

export interface IHashTagsForm {
  hashTag: string;
}

export interface IAppForms
  extends IProjectHeaderForm,
    IProjectForm,
    IProjectNoteForm,
    IHashTagsForm {}

export type HookFormControlType =
  | Control<FieldValues>
  | Control<IProjectForm>
  | Control<IProjectHeaderForm>
  | Control<IHashTagsForm>
  | Control<ISearchForm>
  | Control<IGroupForm>
  | undefined;

export type HookFormRulesType = Omit<
  RegisterOptions<FieldValues, FieldPath<FieldValues>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export type FormValueType = string | boolean | IOption | string[] | undefined;
