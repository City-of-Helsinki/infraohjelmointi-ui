import type { IMyWorkloadEditFormValues } from '@/components/MyWorkload/Table/useMyWorkloadEditForm';
import type { IOption } from '@/interfaces/common';
import type { FormValueType } from '@/interfaces/formInterfaces';
import type { IProjectRequest } from '@/interfaces/projectInterfaces';
import { dirtyFieldsToRequestObject } from '@/utils/common';
import { normalizeMyWorkloadDate } from '@/utils/myWorkloadUtils';

type MyWorkloadEditFieldName = keyof IMyWorkloadEditFormValues;

const myWorkloadToProjectFormField: Record<MyWorkloadEditFieldName, string> = {
  planningStart: 'estPlanningStart',
  planningEnd: 'estPlanningEnd',
  presenceStart: 'presenceStart',
  presenceEnd: 'presenceEnd',
  visibilityStart: 'visibilityStart',
  visibilityEnd: 'visibilityEnd',
  constructionStart: 'estConstructionStart',
  constructionEnd: 'estConstructionEnd',
  planningCostForecast: 'planningCostForecast',
  planningPhaseId: 'planningPhase',
  planningWorkQuantity: 'planningWorkQuantity',
  constructionCostForecast: 'constructionCostForecast',
  constructionPhaseId: 'constructionPhase',
  constructionWorkQuantity: 'constructionWorkQuantity',
  phaseId: 'phase',
  phaseDetailId: 'phaseDetail',
};

const dateFields = new Set<MyWorkloadEditFieldName>([
  'planningStart',
  'planningEnd',
  'presenceStart',
  'presenceEnd',
  'visibilityStart',
  'visibilityEnd',
  'constructionStart',
  'constructionEnd',
]);

const optionFields = new Set<MyWorkloadEditFieldName>([
  'phaseId',
  'phaseDetailId',
  'planningPhaseId',
  'constructionPhaseId',
]);

const commonProjectRequestFields: MyWorkloadEditFieldName[] = ['phaseId', 'phaseDetailId'];

const planningProjectRequestFields: MyWorkloadEditFieldName[] = [
  'planningStart',
  'planningEnd',
  'presenceStart',
  'presenceEnd',
  'visibilityStart',
  'visibilityEnd',
  'planningCostForecast',
  'planningPhaseId',
  'planningWorkQuantity',
];

const constructionProjectRequestFields: MyWorkloadEditFieldName[] = [
  'constructionStart',
  'constructionEnd',
  'constructionCostForecast',
  'constructionPhaseId',
  'constructionWorkQuantity',
];

const toOption = (value: string): IOption => ({
  label: '',
  value,
});

const toProjectFormValue = (field: MyWorkloadEditFieldName, value: string): FormValueType => {
  if (dateFields.has(field)) {
    return normalizeMyWorkloadDate(value) || '';
  }

  if (optionFields.has(field)) {
    return toOption(value);
  }

  return value;
};

const isMyWorkloadFieldChanged = (
  field: MyWorkloadEditFieldName,
  values: IMyWorkloadEditFormValues,
  originalValues: IMyWorkloadEditFormValues,
) => {
  if (dateFields.has(field)) {
    return (
      normalizeMyWorkloadDate(values[field]) !== normalizeMyWorkloadDate(originalValues[field])
    );
  }

  return (values[field] ?? '') !== (originalValues[field] ?? '');
};

export const getMyWorkloadProjectRequestFields = (isPlanningView: boolean) => [
  ...commonProjectRequestFields,
  ...(isPlanningView ? planningProjectRequestFields : constructionProjectRequestFields),
];

export const myWorkloadValuesToProjectRequest = (
  values: IMyWorkloadEditFormValues,
  originalValues: IMyWorkloadEditFormValues,
  fields: MyWorkloadEditFieldName[],
): IProjectRequest => {
  const projectForm = fields.reduce<Record<string, FormValueType>>((form, field) => {
    form[myWorkloadToProjectFormField[field]] = toProjectFormValue(field, values[field]);
    return form;
  }, {});

  const dirtyFields = fields.reduce<Record<string, boolean>>((dirtyFieldMap, field) => {
    if (isMyWorkloadFieldChanged(field, values, originalValues)) {
      dirtyFieldMap[myWorkloadToProjectFormField[field]] = true;
    }

    return dirtyFieldMap;
  }, {});

  return dirtyFieldsToRequestObject(dirtyFields, projectForm);
};
