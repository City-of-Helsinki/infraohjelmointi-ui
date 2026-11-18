import { TFunction } from 'i18next';
import { UseFormGetValues } from 'react-hook-form';
import {
  IMyWorkloadEditFormValues,
  MyWorkloadDateFieldName,
  MyWorkloadTableRow,
} from '@/interfaces/myWorkloadInterfaces';
import { IScheduleDates, validateScheduleDateOrder } from './validation';

export const emptyMyWorkloadEditFormValues: IMyWorkloadEditFormValues = {
  planningStart: '',
  planningEnd: '',
  presenceStart: '',
  presenceEnd: '',
  visibilityStart: '',
  visibilityEnd: '',
  constructionStart: '',
  constructionEnd: '',
  planningCostForecast: '',
  planningPhaseId: '',
  planningWorkQuantity: '',
  constructionCostForecast: '',
  constructionPhaseId: '',
  constructionWorkQuantity: '',
  phaseId: '',
  phaseDetailId: '',
};

export const mapProjectToFormValues = (
  project: MyWorkloadTableRow | null,
): IMyWorkloadEditFormValues => {
  if (!project) {
    return emptyMyWorkloadEditFormValues;
  }

  return {
    planningStart: project.planningStart,
    planningEnd: project.planningEnd,
    presenceStart: project.presenceStart,
    presenceEnd: project.presenceEnd,
    visibilityStart: project.visibilityStart,
    visibilityEnd: project.visibilityEnd,
    constructionStart: project.constructionStart,
    constructionEnd: project.constructionEnd,
    planningCostForecast: project.planningCostForecast,
    planningPhaseId: project.planningPhaseId,
    planningWorkQuantity: project.planningWorkQuantity,
    constructionCostForecast: project.constructionCostForecast,
    constructionPhaseId: project.constructionPhaseId,
    constructionWorkQuantity: project.constructionWorkQuantity,
    phaseId: project.phase.id,
    phaseDetailId: project.phaseDetail.id,
  };
};

export const validateMyWorkloadDateOrder = (
  field: MyWorkloadDateFieldName,
  value: string,
  getValues: UseFormGetValues<IMyWorkloadEditFormValues>,
  t: TFunction<'translation'>,
): string | true => {
  const dates: IScheduleDates = {
    planningStart: getValues('planningStart'),
    planningEnd: getValues('planningEnd'),
    presenceStart: getValues('presenceStart'),
    presenceEnd: getValues('presenceEnd'),
    visibilityStart: getValues('visibilityStart'),
    visibilityEnd: getValues('visibilityEnd'),
    constructionStart: getValues('constructionStart'),
    constructionEnd: getValues('constructionEnd'),
  };

  return validateScheduleDateOrder(field, value, dates, t);
};
