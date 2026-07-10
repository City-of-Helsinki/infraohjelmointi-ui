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
  projectCostForecast: string;
  planningCostForecast: string;
  planningPhaseId: string;
  planningWorkQuantity: string;
  constructionCostForecast: string;
  costForecast: string;
  phase: string;
  phaseValue: string;
  phaseId: string;
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
}

export type MyWorkloadViewType = 'planning' | 'construction';
