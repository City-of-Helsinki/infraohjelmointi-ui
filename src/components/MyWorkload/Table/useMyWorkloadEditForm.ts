import { useEffect } from 'react';
import { TFunction } from 'i18next';
import { useForm, UseFormGetValues } from 'react-hook-form';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { IScheduleDates, validateScheduleDateOrder } from '@/utils/validation';

export interface IMyWorkloadEditFormValues {
  planningStart: string;
  planningEnd: string;
  presenceStart: string;
  presenceEnd: string;
  visibilityStart: string;
  visibilityEnd: string;
  constructionStart: string;
  constructionEnd: string;
  planningCostForecast: string;
  planningPhaseId: string;
  planningWorkQuantity: string;
  constructionCostForecast: string;
  constructionPhaseId: string;
  constructionWorkQuantity: string;
  phaseId: string;
  phaseDetailId: string;
}

export type MyWorkloadDateFieldName =
  | 'planningStart'
  | 'planningEnd'
  | 'presenceStart'
  | 'presenceEnd'
  | 'visibilityStart'
  | 'visibilityEnd'
  | 'constructionStart'
  | 'constructionEnd';

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

/**
 * Date order validation for the MyWorkload edit dialog. The actual order rules are validated in
 * validateScheduleDateOrder, shared with ProjectForm's schedule section.
 */
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

const useMyWorkloadEditForm = (project: MyWorkloadTableRow | null) => {
  const formMethods = useForm<IMyWorkloadEditFormValues>({
    defaultValues: emptyMyWorkloadEditFormValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    formMethods.reset(mapProjectToFormValues(project));
  }, [formMethods, project]);

  return formMethods;
};

export default useMyWorkloadEditForm;
