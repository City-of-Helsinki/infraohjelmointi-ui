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
  estPlanningStart?: string;
  estPlanningEnd?: string;
  estConstructionStart?: string;
  estConstructionEnd?: string;
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
  budgetProposalCurrentYearPlus0: string;
  budgetProposalCurrentYearPlus1: string;
  budgetProposalCurrentYearPlus2: string;
  preliminaryCurrentYearPlus3: string;
  preliminaryCurrentYearPlus4: string;
  preliminaryCurrentYearPlus5: string;
  preliminaryCurrentYearPlus6: string;
  preliminaryCurrentYearPlus7: string;
  preliminaryCurrentYearPlus8: string;
  preliminaryCurrentYearPlus9: string;
  preliminaryCurrentYearPlus10: string;
  louhi: boolean;
  gravel: boolean;
  category: IListItem;
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
  estPlanningStart?: string;
  estPlanningEnd?: string;
  estConstructionStart?: string;
  estConstructionEnd?: string;
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
  budgetProposalCurrentYearPlus0?: string;
  budgetProposalCurrentYearPlus1?: string;
  budgetProposalCurrentYearPlus2?: string;
  preliminaryCurrentYearPlus3?: string;
  preliminaryCurrentYearPlus4?: string;
  preliminaryCurrentYearPlus5?: string;
  preliminaryCurrentYearPlus6?: string;
  preliminaryCurrentYearPlus7?: string;
  preliminaryCurrentYearPlus8?: string;
  preliminaryCurrentYearPlus9?: string;
  preliminaryCurrentYearPlus10?: string;
}

export interface IProjectRequestObject {
  id?: string;
  data: IProjectRequest;
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
