import { IClassHierarchy, ICoordinatorClassHierarchy } from "@/reducers/classSlice";
import { ILocation } from "./locationInterfaces";
import { IProject, IProjectsResponse } from "./projectInterfaces";
import { IPlanningRow, IPlanningRowSelections, PlanningRowType } from "./planningInterfaces";
import { IGroup } from "./groupInterfaces";

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
  'budgetProposal',
  'strategy',
  'constructionProgram',
  'budgetBookSummary',
  'financialStatement',
] as const;

export interface IConstructionProgramCsvRow {
  [key: string]: string | undefined;
}

export interface IBudgetBookSummaryCsvRow {
  [key: string]: string | IFinanceProperties | undefined;
}

export type ReportType = (typeof reports)[number];

export type ReportTableRowType = 'class' | 'project' | 'investmentpart';

export interface IBasicReportData {
  divisions: Array<ILocation>;
  projects: Array<IProject>;
  classes: IClassHierarchy;
  coordinatorRows?: IPlanningRow[];
}

interface ITableRowEssentials {
  id?: string;
  name: string;
  parent: string | null;
}

export interface IFinanceProperties {
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

export interface IFlattenedBudgetBookSummaryProperties extends IFinanceProperties {
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
  
  financeProperties: IFinanceProperties;
}

export interface IConstructionProgramTableRow extends ITableRowEssentials {
  // These first three are should be typed depending on the report type
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
