import { IListItem } from './common';
import { IPerson } from './personsInterfaces';
import { ISapCost } from './sapCostsInterfaces';

export interface IProject {
  id: string;
  projectReadiness: number;
  hkrId: string;
  sapProject?: string;
  sapNetwork: Array<string>;
  type: IListItem;
  name: string;
  address?: string;
  entityName: string;
  description: string;
  phase: IListItem;
  programmed: boolean;
  constructionPhaseDetail: IListItem;
  estPlanningStart: string | null;
  estPlanningEnd: string | null;
  estConstructionStart: string | null;
  estConstructionEnd: string | null;
  estWarrantyPhaseStart: string | null;
  estWarrantyPhaseEnd: string | null;
  presenceStart?: string;
  presenceEnd?: string;
  visibilityStart?: string;
  visibilityEnd?: string;
  projectWorkQuantity: string;
  projectCostForecast: string;
  projectQualityLevel: IListItem;
  planningCostForecast?: string;
  planningPhase?: IListItem;
  planningWorkQuantity?: string;
  constructionCostForecast?: string;
  constructionPhase?: IListItem;
  constructionWorkQuantity?: string;
  budget?: string;
  sapCurrentYear?: string;
  realizedCost?: string;
  comittedCost?: string;
  spentCost?: string;
  perfAmount: string;
  unitCost: string;
  costForecast: string;
  neighborhood: string;
  tiedCurrYear: string;
  riskAssess: string;
  riskAssessment: IListItem;
  priority: IListItem;
  locked: boolean;
  comments: string;
  delays: string;
  createdDate?: string;
  updatedDate?: string;
  siteId?: IBudget;
  projectSet?: IProjectSet;
  area?: IListItem;
  personPlanning?: IPerson;
  personProgramming?: IPerson;
  personConstruction?: IPerson;
  favPersons?: Array<string>;
  hashTags?: Array<string>;
  budgetForecast1CurrentYear?: string;
  budgetForecast2CurrentYear?: string;
  budgetForecast3CurrentYear?: string;
  budgetForecast4CurrentYear?: string;
  finances: IProjectFinances;
  louhi: boolean;
  gravel: boolean;
  category?: IListItem;
  effectHousing: boolean;
  constructionEndYear: number | null;
  planningStartYear: number | null;
  projectClass?: string;
  projectLocation?: string;
  projectDistrict?: string;
  projectProgram?: string;
  otherPersons?: string;
  responsibleZone?: IListItem;
  masterPlanAreaNumber?: string;
  trafficPlanNumber?: string;
  bridgeNumber?: string;
  projectGroup: string | null;
  spentBudget: string;
  pwFolderLink?: string | null;
  frameEstPlanningStart: string | null;
  frameEstPlanningEnd: string | null;
  frameEstConstructionStart: string | null;
  frameEstConstructionEnd: string | null;
  frameEstWarrantyPhaseStart: string | null;
  frameEstWarrantyPhaseEnd: string | null;
  currentYearsSapValues?: Array<ISapCost> | null;
  budgetOverrunReason?: IListItem;
  otherBudgetOverrunReason?: string;
}

export interface IProjectRequest {
  [key: string]: string | null | Array<string> | [] | boolean | IProjectFinancesRequestObject | number | undefined,
  type?: string | null;
  description?: string;
  entityName?: string | null;
  hkrId?: string | null;
  area?: string | null;
  hashTags?: Array<string>;
  sapProject?: string;
  sapNetwork?: Array<string>;
  name?: string | null;
  address?: string | null;
  favPersons?: Array<string> | [];
  phase?: string | null;
  estPlanningStart?: string | null;
  estPlanningEnd?: string | null;
  estConstructionStart?: string | null;
  estConstructionEnd?: string | null;
  estWarrantyPhaseStart?: string | null;
  estWarrantyPhaseEnd?: string | null;
  presenceStart?: string;
  presenceEnd?: string;
  visibilityStart?: string;
  visibilityEnd?: string;
  constructionPhaseDetail?: string | null;
  louhi?: boolean;
  programmed?: boolean;
  gravel?: boolean;
  favourite?: boolean;
  projectWorkQuantity?: string;
  projectCostForecast?: string;
  projectQualityLevel?: string | null;
  planningCostForecast?: string;
  planningPhase?: string | null;
  planningWorkQuantity?: string;
  constructionCostForecast?: string;
  constructionPhase?: string | null;
  constructionWorkQuantity?: string;
  budget?: string;
  realizedCost?: string;
  comittedCost?: string;
  spentCost?: string;
  category?: string | null;
  effectHousing?: boolean;
  riskAssessment?: string | null;
  constructionEndYear?: number | null;
  planningStartYear?: number | null;
  projectClass?: string | null;
  projectLocation?: string | null;
  projectProgram?: string | null;
  responsibleZone?: string | null;
  masterPlanAreaNumber?: string | null;
  trafficPlanNumber?: string | null;
  bridgeNumber?: string | null;
  otherPersons?: string;
  personPlanning?: string;
  personProgramming?: string;
  personConstruction?: string;
  budgetForecast1CurrentYear?: string;
  budgetForecast2CurrentYear?: string;
  budgetForecast3CurrentYear?: string;
  budgetForecast4CurrentYear?: string;
  finances?: IProjectFinancesRequestObject;
  frameEstPlanningStart?: string | null;
  frameEstPlanningEnd?: string | null;
  frameEstConstructionStart?: string | null;
  frameEstConstructionEnd?: string | null;
  budgetOverrunReason?: string;
  otherBudgetOverrunReason?: string;
}

export interface IProjectPatchRequestObject {
  id?: string;
  data: IProjectRequest;
}

export interface IProjectPostRequestObject {
  data: IProjectRequest;
}

export interface IProjectGetRequestObject {
  page: number;
  year?: string;
}

export interface IProjectsPatchRequestObject {
  data: Array<IProjectPatchRequestObject>;
}

// These will be used to render the icons for projects in the planning view list
export enum ProjectType {
  ProjectComplex = 'projectComplex',
  Street = 'street',
  Traffic = 'traffic',
  Sports = 'sports',
  Omastadi = 'omaStadi',
  ProjectArea = 'projectArea',
  Park = 'park',
  PreConstruction = 'preConstruction',
}

// These will be used in order to render the icons for project header phase field
export enum ProjectPhase {
  Proposal = 'proposal',
  Design = 'design',
  Programming = 'programming',
  DraftInitiation = 'draftInitiation',
  DraftApproval = 'draftApproval',
  ConstructionPlan = 'constructionPlan',
  ConstructionWait = 'constructionWait',
  Construction = 'construction',
  WarrantyPeriod = 'warrantyPeriod',
  Completed = 'completed',
}

export enum ProjectArea {
  Hakaniemi = 'hakaniemi',
  Kaisaniemi = 'kaisaniemi',
}

export enum ProjectPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

interface IProjectSet {
  id: string;
  sapProject: Array<string>;
  sapNetworks: Array<string>;
  name: string;
  hkrId: string;
  description: string;
  projectPhase: IListItem;
  programmed: boolean;
  responsiblePerson: IPerson;
}

interface IBudget {
  id: string;
  budgetMain: number;
  budgetPlan: number;
  site: string;
  siteName: string;
  district: string;
  need: number;
}

export interface IProjectArea {
  id: string;
  areaName: string;
  location: string;
}

export interface IProjectsResponse {
  results: Array<IProject>;
  count: number;
  next?: string | null;
}

export interface IProjectResponse {
  data: IProject;
  status: number;
}

export interface IProjectFinancesRequestObject {
  year: number;
  forcedToFrame?: boolean;
  budgetProposalCurrentYearPlus0?: string | null;
  budgetProposalCurrentYearPlus1?: string | null;
  budgetProposalCurrentYearPlus2?: string | null;
  preliminaryCurrentYearPlus3?: string | null;
  preliminaryCurrentYearPlus4?: string | null;
  preliminaryCurrentYearPlus5?: string | null;
  preliminaryCurrentYearPlus6?: string | null;
  preliminaryCurrentYearPlus7?: string | null;
  preliminaryCurrentYearPlus8?: string | null;
  preliminaryCurrentYearPlus9?: string | null;
  preliminaryCurrentYearPlus10?: string | null;
}

export interface IProjectFinances {
  year: number;
  budgetProposalCurrentYearPlus0: string | null;
  budgetProposalCurrentYearPlus1: string | null;
  budgetProposalCurrentYearPlus2: string | null;
  preliminaryCurrentYearPlus3: string | null;
  preliminaryCurrentYearPlus4: string | null;
  preliminaryCurrentYearPlus5: string | null;
  preliminaryCurrentYearPlus6: string | null;
  preliminaryCurrentYearPlus7: string | null;
  preliminaryCurrentYearPlus8: string | null;
  preliminaryCurrentYearPlus9: string | null;
  preliminaryCurrentYearPlus10: string | null;
}

export type CellType =
  | 'planningStart'
  | 'planningEnd'
  | 'planning'
  | 'constructionStart'
  | 'constructionEnd'
  | 'construction'
  | 'warrantyPhaseStart'
  | 'warrantyPhaseEnd'
  | 'warrantyPhase'
  | 'overlap'
  | 'constructionAndWarrantyOverlap'
  | 'none';

export type ProjectCellGrowDirection = 'left' | 'right';

export interface IMonthlyData {
  month: string;
  planning: { isStart: boolean; percent: string };
  construction: { isStart: boolean; percent: string };
  warrantyPhase: { isStart: boolean; percent: string };
}

export interface ITimelineDates {
  planningStart: null | string;
  planningEnd: null | string;
  constructionStart: null | string;
  constructionEnd: null | string;
  estWarrantyPhaseStart: null | string | undefined;
  estWarrantyPhaseEnd: null | string | undefined;
}

export interface IProjectEstDates {
  estPlanningStart: string | null;
  estPlanningEnd: string | null;
  estConstructionStart: string | null;
  estConstructionEnd: string | null;
}

export interface IProjectCell {
  /**
   * Year for the current cell
   */
  year: number;
  /**
   * Start year of the timeline
   */
  startYear: number;
  /**
   * Type of the cell (planningStart / planningEnd / planning / constructionStart / constructionEnd / construction / overlap / none)
   */
  type: CellType;
  /**
   * Previous cell to the left (used when adding new cells)
   */
  prev: IProjectCell | null;
  /**
   * Next cell to the right (used when adding new cells)
   */
  next: IProjectCell | null;
  /**
   * Is the cell the start of the timeline
   */
  isStartOfTimeline: boolean;
  /**
   * Is the cell the end of the timeline
   */
  isEndOfTimeline: boolean;
  /**
   * Is the cell the last of its type (i.e. last planning cell)
   */
  isLastOfType: boolean;
  /**
   * Object key for the budget that the cell represents
   */
  financeKey: keyof IProjectFinances;
  /**
   * Budget (keur value) of the cell
   */
  budget: string | null;
  /**
   * Cell that should be updated if this cell is removed (used to set a new budget and update the dates of the timeline)
   */
  cellToUpdate: IProjectCell | null;
  /**
   * An object that should be added to the delete request, it resets the previously hidden null-values back to '0'
   */
  financesToReset: IProjectFinancesRequestObject | null;
  /**
   * Tells which direction the cell can grow, used for rendering the 'left' and 'right' buttons around the cell
   */
  growDirections: Array<ProjectCellGrowDirection>;
  /**
   * Title of the project (used in the custom context menu when right-clicking a cell)
   */
  title: string;
  /**
   * Id of the project (used when setting the active css-class to the row )
   */
  id: string;
  /**
   * Wether the cell affects the start/ends dates associated with the timeline
   */
  affectsDates: boolean;
  /**
   * A list of all the months for the current year with a percentage indicator of how much each month has planning
   * and construction. This percentage is used to draw the "bar-chart" for the monthly view when selecting a year to
   * view in the planning summary table.
   */
  monthlyDataList: Array<IMonthlyData>;
  /**
   * The dates used to draw the timeline, these can be a combination of
   * estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd and planningStartYear and planningEndYear
   */
  timelineDates: ITimelineDates;
  /**
   * The estPlanningStart, estPlanningEnd, estConstructionStart, estConstructionEnd properties from the project
   */
  projectEstDates: IProjectEstDates;
}
