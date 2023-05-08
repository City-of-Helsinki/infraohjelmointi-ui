import { IListItem } from './common';

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
  estPlanningStart?: string | null;
  estPlanningEnd?: string | null;
  estConstructionStart?: string | null;
  estConstructionEnd?: string | null;
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
  realizedCost?: string;
  comittedCost?: string;
  spentCost?: string;
  budgetOverrunYear?: string;
  budgetOverrunAmount?: string;
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
  constructionEndYear: string;
  planningStartYear: string;
  projectClass?: string;
  projectLocation?: string;
  projectProgram?: string;
  otherPersons?: string;
  responsibleZone?: IListItem;
  masterPlanAreaNumber?: string;
  trafficPlanNumber?: string;
  bridgeNumber?: string;
  projectGroup: string | null;
  spentBudget: number;
  pwFolderLink?: string | null;
}

export interface IProjectRequest {
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
  budgetOverrunYear?: string;
  budgetOverrunAmount?: string;
  category?: string | null;
  effectHousing?: boolean;
  riskAssessment?: string | null;
  constructionEndYear?: string;
  planningStartYear?: string;
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
}

export interface IProjectPatchRequestObject {
  id?: string;
  data: IProjectRequest;
}

export interface IProjectGetRequestObject {
  page: number;
  year?: string;
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

export interface IPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  phone: string;
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
}

export interface IProjectFinancesRequestObject {
  year: number;
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
  | 'planStart'
  | 'planEnd'
  | 'plan'
  | 'conStart'
  | 'conEnd'
  | 'con'
  | 'overlap'
  | 'none';

export type ProjectCellGrowDirection = 'left' | 'right';

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
   * Type of the cell (planStart / planEnd / plan / conStart / conEnd / con / overlap / none)
   */
  type: CellType;
  /**
   * When planning starts (can be used to get the timeline schedule for any cell)
   */
  planStart?: string | null;
  /**
   * When planning ends (can be used to get the timeline schedule for any cell)
   */
  planEnd?: string | null;
  /**
   * When construction starts (can be used to get the timeline schedule for any cell)
   */
  conStart?: string | null;
  /**
   * When construction ends (can be used to get the timeline schedule for any cell)
   */
  conEnd?: string | null;
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
   * Wether the cell is an edge cell, an edge cell is a cell that affects the start/ends dates associated with the timeline
   */
  isEdgeCell: boolean;
}
