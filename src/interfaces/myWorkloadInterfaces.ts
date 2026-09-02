import { ProjectTaskType } from './projectInterfaces';

export interface PhaseInfo {
  id: string;
  label: string;
  value: string;
}

export interface MyWorkloadTableRow {
  id: string;
  budget: string;
  projectName: string;
  description: string;
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
  phase: PhaseInfo;
  phaseDetail: PhaseInfo;
  functions: string;
  constructionProcurementMethod: string | undefined;
}

export interface MyWorkloadTaskItem {
  id: string;
  budget: string;
  projectName: string;
  planningPeriod: string;
  constructionPeriod: string;
  constructionProcurementMethod: string;
  taskDescription: string;
  taskType: ProjectTaskType;
}

export type MyWorkloadViewType = 'planning' | 'construction';
