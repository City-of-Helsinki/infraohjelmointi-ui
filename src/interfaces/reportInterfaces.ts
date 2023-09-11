export const reports = [
  'budgetProposal',
  'strategy',
  'constructionProgram',
  'budgetBookSummary',
  'financialStatement',
] as const;

export type ReportType = (typeof reports)[number];

export type ConstructionProgramTableRowType = 'class' | 'project';

export interface IConstructionProgramTableRow {
  name: string;
  parent: string | null;
  id: string;
  location: string;
  costForecast: string;
  startAndEnd: string;
  spentBudget: string;
  budgetProposalCurrentYearPlus0: string;
  budgetProposalCurrentYearPlus1: string;
  budgetProposalCurrentYearPlus2: string;
  children: Array<IConstructionProgramTableRow>;
  projects: Array<IConstructionProgramTableRow>;
  type: ConstructionProgramTableRowType;
}
