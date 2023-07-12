export const reports = [
  'budgetProposal',
  'strategy',
  'constructionProgram',
  'budgetBookSummary',
  'financialStatement',
] as const;

export type ReportType = (typeof reports)[number];
