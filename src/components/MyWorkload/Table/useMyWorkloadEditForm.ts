import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { formatBudgetEuro } from '@/utils/currencyUtils';

export interface IMyWorkloadEditFormValues {
  planningStart: string;
  planningEnd: string;
  presenceStart: string;
  presenceEnd: string;
  visibilityStart: string;
  visibilityEnd: string;
  constructionStart: string;
  constructionEnd: string;
  projectCostForecast: string;
  planningCostForecast: string;
  planningPhaseId: string;
  planningWorkQuantity: string;
  constructionCostForecast: string;
  costForecast: string;
  phaseId: string;
}

export const emptyMyWorkloadEditFormValues: IMyWorkloadEditFormValues = {
  planningStart: '',
  planningEnd: '',
  presenceStart: '',
  presenceEnd: '',
  visibilityStart: '',
  visibilityEnd: '',
  constructionStart: '',
  constructionEnd: '',
  projectCostForecast: '',
  planningCostForecast: '',
  planningPhaseId: '',
  planningWorkQuantity: '',
  constructionCostForecast: '',
  costForecast: '',
  phaseId: '',
};

const mapProjectToFormValues = (project: MyWorkloadTableRow | null): IMyWorkloadEditFormValues => {
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
    projectCostForecast: project.projectCostForecast,
    planningCostForecast: project.planningCostForecast,
    planningPhaseId: project.planningPhaseId,
    planningWorkQuantity: project.planningWorkQuantity,
    constructionCostForecast: project.constructionCostForecast,
    costForecast: formatBudgetEuro(project.costForecast),
    phaseId: project.phaseId,
  };
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
