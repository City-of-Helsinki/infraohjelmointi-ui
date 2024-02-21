import { IClassHierarchy } from "@/reducers/classSlice";
import { ILocation } from "./locationInterfaces";
import { IProject } from "./projectInterfaces";

export const reports = [
  'budgetProposal',
  'strategy',
  'constructionProgram',
  'budgetBookSummary',
  'financialStatement',
] as const;

export type ReportType = (typeof reports)[number];

export type ConstructionProgramTableRowType = 'class' | 'project';

interface ITableRowEssentials {
  name: string;
  parent: string | null;
  costForecast: string;
}

export interface IConstructionProgramTableRow extends ITableRowEssentials {
  // These first three are should be typed depending on the report type
  children: Array<IConstructionProgramTableRow>;
  projects: Array<IConstructionProgramTableRow>;
  type: ConstructionProgramTableRowType;

  id?: string;
  location?: string;
  startAndEnd?: string;
  spentBudget?: string;
  budgetProposalCurrentYearPlus0?: string;
  budgetProposalCurrentYearPlus1?: string;
  budgetProposalCurrentYearPlus2?: string;
}

export interface IBasicReportData {
  divisions: Array<ILocation>;
  projects: Array<IProject>;
  classes: IClassHierarchy;
}
