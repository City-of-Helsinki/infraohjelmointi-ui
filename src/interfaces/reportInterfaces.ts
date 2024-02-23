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
export type BudgetBookSummaryTableRowType = 'class';

interface ITableRowEssentials {
  id?: string;
  name: string;
  parent: string | null;
}

export interface IConstructionProgramTableRow extends ITableRowEssentials {
  // These first three are should be typed depending on the report type
  children: Array<IConstructionProgramTableRow>;
  projects: Array<IConstructionProgramTableRow>;
  type: ConstructionProgramTableRowType;

  costForecast?: string;
  location?: string;
  startAndEnd?: string;
  spentBudget?: string;
  budgetProposalCurrentYearPlus0?: string;
  budgetProposalCurrentYearPlus1?: string;
  budgetProposalCurrentYearPlus2?: string;
}


export interface IBudgetBookSummaryTableRow extends ITableRowEssentials {
  children: Array<IBudgetBookSummaryTableRow>;
  projects: Array<IBudgetBookSummaryTableRow>;
  type: BudgetBookSummaryTableRowType;
  financeProperties: {
    usage?: string; 
    budgetEstimation?: string; //first TA column means talousarvio
    budgetEstimationSuggestion?: string; //second TA column means talousarvioehdotus
    budgetPlanSuggestion1?: string; // TS = taloussunnitelmaehdotus
    budgetPlanSuggestion2?: string; // TS = taloussunnitelmaehdotus
    initial1?: string;
    initial2?: string;
    initial3?: string;
    initial4?: string;
    initial5?: string;
    initial6?: string;
    initial7?: string;
  }
}

export interface IBasicReportData {
  divisions: Array<ILocation>;
  projects: Array<IProject>;
  classes: IClassHierarchy;
}
