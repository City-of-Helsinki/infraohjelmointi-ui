import { IClassHierarchy, ICoordinatorClassHierarchy } from "@/reducers/classSlice";
import { ILocation } from "./locationInterfaces";
import { IProject, IProjectsResponse } from "./projectInterfaces";
import { IPlanningRow, IPlanningRowSelections, PlanningRowType } from "./planningInterfaces";
import { IGroup } from "./groupInterfaces";
import { IListItem } from "./common";

export type getForcedToFrameDataType = Promise<{ 
    res: IProjectsResponse;
    projects: IProject[];
    classHierarchy: ICoordinatorClassHierarchy;
    forcedToFrameDistricts: {
      districts: ILocation[];
      year: number;
      allLocations?: ILocation[];
      divisions?: ILocation[];
      subDivisions?: ILocation[];
    };
    groupRes: IGroup[];
    initialSelections: IPlanningRowSelections}>;

export const reports = [
  'operationalEnvironmentAnalysis',
  'strategy',
  'constructionProgram',
  'budgetBookSummary',
  'financialStatement',
] as const;

export interface IConstructionProgramCsvRow {
  [key: string]: string | undefined;
}

export interface IStrategyTableCsvRow {
  [key: string]: string | undefined;
}

export interface IBudgetBookSummaryCsvRow {
  [key: string]: string | IBudgetBookFinanceProperties | undefined;
}

export interface IOperationalEnvironmentAnalysisCsvRow {
  [key: string]: string | IOperationalEnvironmentAnalysisFinanceProperties | undefined;
}

export enum Reports {
  OperationalEnvironmentAnalysis = 'operationalEnvironmentAnalysis',
  Strategy = 'strategy',
  ConstructionProgram = 'constructionProgram',
  BudgetBookSummary = 'budgetBookSummary',
  FinancialStatement = 'financialStatement',
}

export type ReportType = (typeof reports)[number];

export type ReportTableRowType = 'class' | 'project' | 'investmentpart' | 'location' | 'crossingPressure' | 'taeTseFrame' | 'category';

export interface IBasicReportData {
  divisions: Array<ILocation>;
  projects: Array<IProject>;
  classes: IClassHierarchy;
  categories?: IListItem[];
  coordinatorRows?: IPlanningRow[];
}

interface ITableRowEssentials {
  id?: string;
  name: string;
  parent: string | null;
}

export interface IOperationalEnvironmentAnalysisFinanceProperties {
  costForecast?: string;
  TAE?: string;
  TSE1?: string;
  TSE2?: string;
  initial1?: string;
  initial2?: string;
  initial3?: string;
  initial4?: string;
  initial5?: string;
  initial6?: string;
  initial7?: string;
  [key: string]: string | undefined;
}

export interface IFlattenedOperationalEnvironmentAnalysisProperties extends IOperationalEnvironmentAnalysisFinanceProperties {
  id: string;
  name: string;
  type: ReportTableRowType;
}

export interface IBudgetBookFinanceProperties {
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
  [key: string]: string | undefined;
}

export interface IFlattenedBudgetBookSummaryProperties extends IBudgetBookFinanceProperties {
  id: string;
  name: string;
}

export interface IStrategyTableRow extends ITableRowEssentials {
  projects: Array<IStrategyTableRow>
  children: Array<IStrategyTableRow>
  type: ReportTableRowType
  projectManager?: string;
  projectPhase?: string;
  costPlan?: string;
  costForecast?: string;
  januaryStatus?: string;
  februaryStatus?: string;
  marchStatus?: string;
  aprilStatus?: string;
  mayStatus?: string;
  juneStatus?: string;
  julyStatus?: string;
  augustStatus?: string;
  septemberStatus?: string;
  octoberStatus?: string;
  novemberStatus?: string;
  decemberStatus?: string;
}

export interface IBudgetBookSummaryTableRow extends ITableRowEssentials {
  children: Array<IBudgetBookSummaryTableRow>;
  projects: Array<IBudgetBookSummaryTableRow>;
  type: ReportTableRowType;
  objectType: PlanningRowType | '',
  
  financeProperties: IBudgetBookFinanceProperties;
}

export interface IConstructionProgramTableRow extends ITableRowEssentials {
  children: Array<IConstructionProgramTableRow>;
  projects: Array<IConstructionProgramTableRow>;
  type: ReportTableRowType;

  costForecast?: string;
  location?: string;
  startAndEnd?: string;
  spentBudget?: string;
  budgetProposalCurrentYearPlus0?: string;
  budgetProposalCurrentYearPlus1?: string;
  budgetProposalCurrentYearPlus2?: string;
}

export interface IPlannedBudgets {
  plannedCostForecast?: string;
  plannedTAE?: string;
  plannedTSE1?: string;
  plannedTSE2?: string;
  plannedInitial1?: string;
  plannedInitial2?: string;
  plannedInitial3?: string;
  plannedInitial4?: string;
  plannedInitial5?: string;
  plannedInitial6?: string;
  plannedInitial7?: string;
}

export interface ITotals {
  plannedCostForecast: number;
  plannedTAE: number;
  plannedTSE1: number;
  plannedTSE2: number;
  plannedInitial1: number;
  plannedInitial2: number;
  plannedInitial3: number;
  plannedInitial4: number;
  plannedInitial5: number;
  plannedInitial6: number;
  plannedInitial7: number;
}

export interface ICategoryArray {
  children: [],
  frameBudgets: [],
  plannedBudgets?: IPlannedBudgets,
  plannedBudgetsForCategories: ITotals,
  id: string,
  name: string,
  projects: [],
  type: string,
}

export interface IOperationalEnvironmentAnalysisTableRow extends ITableRowEssentials {
  children: Array<IOperationalEnvironmentAnalysisTableRow>;
  projects: Array<IOperationalEnvironmentAnalysisTableRow>;
  type: ReportTableRowType;
  category?: {
    id?: string;
    updatedDate?: string;
    value?: string;
  }
  plannedBudgetsForCategories?: IPlannedBudgets;
  frameBudgets: IOperationalEnvironmentAnalysisFinanceProperties;
  plannedBudgets: IPlannedBudgets;
  // ylityspaine
  crossingPressure?: { 
    cpCostForecast?: string;
    cpTAE?: string;
    cpTSE1?: string;
    cpTSE2?: string;
    cpInitial1?: string;
    cpInitial2?: string;
    cpInitial3?: string;
    cpInitial4?: string;
    cpInitial5?: string;
    cpInitial6?: string;
    cpInitial7?: string;
  }
}