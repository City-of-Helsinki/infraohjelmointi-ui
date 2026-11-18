import { TFunction } from 'i18next';
import { IListItem } from '@/interfaces/common';
import { MyWorkloadTableRow, MyWorkloadTaskItem } from '@/interfaces/myWorkloadInterfaces';
import { IProject, IProjectTask } from '@/interfaces/projectInterfaces';
import {
  formatMyWorkloadDateForDisplay,
  normalizeMyWorkloadDate,
  toPhaseInfo,
} from './myWorkloadUtils';

export const mapProjectToMyWorkloadTableRow = (
  project: IProject,
  translate: (key: string) => string,
): MyWorkloadTableRow => ({
  id: project.id,
  budget: project.budget ?? '',
  projectName: project.name,
  description: project.description,
  planningStart: normalizeMyWorkloadDate(project.estPlanningStart),
  planningEnd: normalizeMyWorkloadDate(project.estPlanningEnd),
  presenceStart: normalizeMyWorkloadDate(project.presenceStart),
  presenceEnd: normalizeMyWorkloadDate(project.presenceEnd),
  visibilityStart: normalizeMyWorkloadDate(project.visibilityStart),
  visibilityEnd: normalizeMyWorkloadDate(project.visibilityEnd),
  constructionStart: normalizeMyWorkloadDate(project.estConstructionStart),
  constructionEnd: normalizeMyWorkloadDate(project.estConstructionEnd),
  planningCostForecast: project.planningCostForecast ?? '',
  planningPhaseId: project.planningPhase?.id ?? '',
  planningWorkQuantity: project.planningWorkQuantity ?? '',
  constructionCostForecast: project.constructionCostForecast ?? '',
  constructionPhaseId: project.constructionPhase?.id ?? '',
  constructionWorkQuantity: project.constructionWorkQuantity ?? '',
  phase: toPhaseInfo(project.phase, translate),
  phaseDetail: toPhaseInfo(project.phaseDetail, translate),
  constructionProcurementMethod: project.constructionProcurementMethod?.value,
  functions: translate('myWorkloadView.table.modifyInformation'),
});

export const mapProjectToMyWorkloadTask = (
  project: IProjectTask,
  t: TFunction,
): MyWorkloadTaskItem => {
  const unavailableText = t('myWorkloadView.tasks.infoNotAvailable');
  const formatPeriod = (startDate: string | null, endDate: string | null): string => {
    const start = formatMyWorkloadDateForDisplay(startDate);
    const end = formatMyWorkloadDateForDisplay(endDate);
    return !start && !end
      ? unavailableText
      : `${start || unavailableText} - ${end || unavailableText}`;
  };

  return {
    id: project.id,
    budget: project.budget?.toString() ?? project.costForecast?.toString() ?? '',
    totalCost: project.totalCost?.toString() ?? '',
    projectName: project.name,
    planningPeriod: formatPeriod(project.estPlanningStart, project.estPlanningEnd),
    constructionPeriod: formatPeriod(project.estConstructionStart, project.estConstructionEnd),
    constructionProcurementMethod: project.constructionProcurementMethod?.value
      ? t(`option.${project.constructionProcurementMethod.value}`)
      : unavailableText,
    taskDescription: t(`myWorkloadView.tasks.taskDescription.${project.taskType}`),
    taskType: project.taskType,
  };
};

export const mergeMyWorkloadProjectResponse = (
  project: MyWorkloadTableRow,
  patchedProject: Partial<IProject>,
  t: TFunction,
): MyWorkloadTableRow => {
  const resolveDateValue = (patchedValue: string | null | undefined, fallback: string) =>
    patchedValue === undefined ? fallback : normalizeMyWorkloadDate(patchedValue);
  const resolveTextValue = (patchedValue: string | null | undefined, fallback: string) =>
    patchedValue === undefined ? fallback : (patchedValue ?? '');
  const resolveOptionIdValue = (patchedValue: IListItem | null | undefined, fallback: string) =>
    patchedValue === undefined ? fallback : (patchedValue?.id ?? '');
  const resolvePhaseInfo = (
    patchedValue: IListItem | null | undefined,
    fallback: MyWorkloadTableRow['phase'],
  ) => (patchedValue === undefined ? fallback : toPhaseInfo(patchedValue ?? undefined, t));

  return {
    ...project,
    planningStart: resolveDateValue(patchedProject.estPlanningStart, project.planningStart),
    planningEnd: resolveDateValue(patchedProject.estPlanningEnd, project.planningEnd),
    presenceStart: resolveDateValue(patchedProject.presenceStart, project.presenceStart),
    presenceEnd: resolveDateValue(patchedProject.presenceEnd, project.presenceEnd),
    visibilityStart: resolveDateValue(patchedProject.visibilityStart, project.visibilityStart),
    visibilityEnd: resolveDateValue(patchedProject.visibilityEnd, project.visibilityEnd),
    constructionStart: resolveDateValue(
      patchedProject.estConstructionStart,
      project.constructionStart,
    ),
    constructionEnd: resolveDateValue(patchedProject.estConstructionEnd, project.constructionEnd),
    planningCostForecast: resolveTextValue(
      patchedProject.planningCostForecast,
      project.planningCostForecast,
    ),
    planningPhaseId: resolveOptionIdValue(patchedProject.planningPhase, project.planningPhaseId),
    planningWorkQuantity: resolveTextValue(
      patchedProject.planningWorkQuantity,
      project.planningWorkQuantity,
    ),
    constructionCostForecast: resolveTextValue(
      patchedProject.constructionCostForecast,
      project.constructionCostForecast,
    ),
    constructionPhaseId: resolveOptionIdValue(
      patchedProject.constructionPhase,
      project.constructionPhaseId,
    ),
    constructionWorkQuantity: resolveTextValue(
      patchedProject.constructionWorkQuantity,
      project.constructionWorkQuantity,
    ),
    phase: resolvePhaseInfo(patchedProject.phase, project.phase),
    phaseDetail: resolvePhaseInfo(patchedProject.phaseDetail, project.phaseDetail),
  };
};
