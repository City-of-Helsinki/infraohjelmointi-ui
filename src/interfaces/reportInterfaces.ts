import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';
import { ILocation } from './locationInterfaces';
import { IProject, IProjectsResponse } from './projectInterfaces';
import {
  IPlanningCell,
  IPlanningRow,
  IPlanningRowSelections,
  PlanningRowType,
} from './planningInterfaces';
import { IGroup } from './groupInterfaces';
import { IListItem } from './common';
import { IProjectSapCost } from './sapCostsInterfaces';

export type IGetForcedToFrameData = {
  res: IProjectsResponse;
  projects: IProject[];
  projectsInWarrantyPhase?: IProject[];
  classHierarchy: ICoordinatorClassHierarchy;
  forcedToFrameDistricts: {
    districts: ILocation[];
    year: number;
    allLocations?: ILocation[];
    divisions?: ILocation[];
    subDivisions?: ILocation[];
  };
  groupRes: IGroup[];
  initialSelections: IPlanningRowSelections;
};

export type IGetForcedToFrameDataPromise = Promise<IGetForcedToFrameData>;

export type IPlanningData = {
  res: IProjectsResponse;
  projects: IProject[];
  classHierarchy: IClassHierarchy;
  planningDistricts:
    | {
        districts: ILocation[];
        year: number;
        allLocations?: ILocation[];
        divisions?: ILocation[];
        subDivisions?: ILocation[];
      }
    | {
        districts: ILocation[];
        allLocations: ILocation[];
        divisions: ILocation[];
        subDivisions: ILocation[];
        year: number;
      };
  groupRes: IGroup[];
  initialSelections: IPlanningRowSelections;
};

export const reports = [
  'operationalEnvironmentAnalysis',
  'operationalEnvironmentAnalysisForcedToFrame',
  'strategy',
  'strategyForcedToFrame',
  'forecastReport',
  'constructionProgramForecast',
  'constructionProgram',
  'constructionProgramForcedToFrame',
  'budgetBookSummary',
  'financialStatement',
] as const;

export interface IConstructionProgramCsvRow {
  [key: string]: string | undefined;
}

export interface IStrategyTableCsvRow {
  [key: string]: string | undefined;
}

export interface IForecastTableCsvRow {
  [key: string]: string | undefined;
}

export interface IBudgetBookSummaryCsvRow {
  [key: string]: string | IBudgetBookFinanceProperties | undefined;
}

export interface IOperationalEnvironmentAnalysisCsvRow {
  [key: string]: string | IOperationalEnvironmentAnalysisFinanceProperties | undefined;
}

export interface IOperationalEnvironmentAnalysisSummaryCsvRow {
  [key: string]: string | IOperationalEnvironmentAnalysisFinanceProperties | undefined | number;
}

export enum Reports {
  OperationalEnvironmentAnalysis = 'operationalEnvironmentAnalysis',
  OperationalEnvironmentAnalysisForcedToFrame = 'operationalEnvironmentAnalysisForcedToFrame',
  Strategy = 'strategy',
  StrategyForcedToFrame = 'strategyForcedToFrame',
  ConstructionProgram = 'constructionProgram',
  ConstructionProgramForcedToFrame = 'constructionProgramForcedToFrame',
  ConstructionProgramForecast = 'constructionProgramForecast',
  ForecastReport = 'forecastReport',
  BudgetBookSummary = 'budgetBookSummary',
  FinancialStatement = 'financialStatement',
}

export type ReportType = (typeof reports)[number];

export type ReportTableRowType =
  | 'class'
  | 'project'
  | 'investmentpart'
  | 'location'
  | 'crossingPressure'
  | 'taeTseFrame'
  | 'category'
  | 'group'
  | 'groupWithValues'
  | 'districtPreview'
  | 'subLevelDistrict'
  | 'collectiveSubLevel'
  | 'otherClassification'
  | 'changePressure'
  | 'taeFrame'
  | 'division'
  | 'subClassDistrict'
  | 'empty'
  | 'info';

export interface IBasicReportData {
  categories?: IListItem[];
  rows: IPlanningRow[];
  divisions?: Array<IListItem>;
  subDivisions?: Array<IListItem>;
}

interface ITableRowEssentials {
  id?: string;
  name: string;
  parent: string | null | undefined;
}
export interface IChild {
  cells: IPlanningCell[];
  children?: IOperationalEnvironmentAnalysisTableRow[];
  projects?: IOperationalEnvironmentAnalysisTableRow[];
  type: ReportTableRowType;
  parent?: string | null;
  name: string;
  id: string;
  costforecast?: string;
  frameBudgets: IOperationalEnvironmentAnalysisFinanceProperties;
  plannedBudgets: IPlannedBudgets;
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

export interface IFlattenedOperationalEnvironmentAnalysisProperties
  extends IOperationalEnvironmentAnalysisFinanceProperties {
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
  type: string;
}

export interface IStrategyAndForecastTableRow extends ITableRowEssentials {
  projects: Array<IStrategyAndForecastTableRow>;
  children: Array<IStrategyAndForecastTableRow>;
  type: ReportTableRowType;
  projectManager?: string;
  projectPhase?: string;
  costPlan?: string;
  costForecast?: string;
  costForcedToFrameBudget?: string;
  costForecastDeviation?: string;
  budgetOverrunReason?: string;
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
  objectType: PlanningRowType | '';

  financeProperties: IBudgetBookFinanceProperties;
}

export interface IConstructionProgramTableRow extends ITableRowEssentials {
  children: Array<IConstructionProgramTableRow>;
  projects: Array<IConstructionProgramTableRow>;
  type: ReportTableRowType;

  path?: string;
  costForecast?: string;
  location?: string;
  startAndEnd?: string;
  spentBudget?: string;
  budgetProposalCurrentYearPlus0?: string;
  budgetProposalCurrentYearPlus1?: string;
  budgetProposalCurrentYearPlus2?: string;
  isProjectOnSchedule?: string;
  budgetOverrunReason?: string;
  costForcedToFrameBudget?: string;
  costForecastDeviation?: string;
  costForecastDeviationPercent?: string;
  currentYearSapCost?: string;
  beforeCurrentYearSapCosts?: string;
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
  children: [];
  frameBudgets: [];
  plannedBudgets?: IPlannedBudgets;
  plannedBudgetsForCategories: ITotals;
  id: string;
  name: string;
  projects: [];
  type: string;
}

export interface IOperationalEnvironmentAnalysisTableRow extends ITableRowEssentials {
  children: Array<IOperationalEnvironmentAnalysisTableRow>;
  projects: Array<IOperationalEnvironmentAnalysisTableRow>;
  type: ReportTableRowType;
  category?: {
    id?: string;
    updatedDate?: string;
    value?: string;
  };
  plannedBudgetsForCategories?: IPlannedBudgets;
  frameBudgets: IOperationalEnvironmentAnalysisFinanceProperties;
  plannedBudgets: IPlannedBudgets;
  // muutospaine
  changePressure?: {
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
  };
}

export interface IOperationalEnvironmentAnalysisSummaryCategoryRowData {
    costForecast: string;
    TAE: string;
    TSE1: string;
    TSE2: string;
    initial1: string;
    initial2: string;
    initial3: string;
    initial4: string;
    initial5: string;
    initial6: string;
    initial7: string;
}

export interface IOperationalEnvironmentAnalysisSummaryCategoryRow {
  id: string | undefined;
  name: string;
  type: string;
  data: IOperationalEnvironmentAnalysisSummaryCategoryRowData;
}

export interface IOperationalEnvironmentAnalysisSummaryRow {
  id: string | undefined;
  name: string;
  type: string;
  categories: IOperationalEnvironmentAnalysisSummaryCategoryRow[];
}

export interface IDownloadCsvButtonProps {
  type: ReportType;
  getForcedToFrameData: (year: number, forcedToFrame: boolean) => IGetForcedToFrameDataPromise;
  getPlanningData: (year: number) => Promise<IPlanningData>;
  getPlanningRows: (res: IPlanningData) => IPlanningRow[];
  getCategories: () => Promise<IListItem[]>;
  sapCosts?: Record<string, IProjectSapCost>;
  currentYearSapValues?: Record<string, IProjectSapCost>;
  year?: number;
}

export interface IDownloadPdfButtonProps {
  type: ReportType;
  getForcedToFrameData: (year: number, forcedToFrame: boolean) => IGetForcedToFrameDataPromise;
  getPlanningData: (year: number) => Promise<IPlanningData>;
  getPlanningRows: (res: IPlanningData) => IPlanningRow[];
  getCategories: () => Promise<IListItem[]>;
  year?: number;
}
