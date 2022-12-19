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
  louhi: boolean;
  gravel: boolean;
  category: IListItem;
  effectHousing: boolean;
  constructionEndYear: string;
  planningStartYear: string;
  projectClass?: string;
  projectLocation?: string;
  projectProgram?: string;
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
}

export interface IProjectRequestObject {
  id?: string;
  data: IProjectRequest;
}

export enum ProjectType {
  ProjectComplex = 'a86ecdd0-d53e-45fc-95bf-d9ddcf82c8ba',
  Street = '2d5a2f44-2dc1-4f3a-8616-40d0d6d7e6fc',
  Traffic = 'dafdbe4f-2d89-4c5a-9be4-cef00b3c1ce4',
  Sports = '262aef64-7704-448b-b434-6973570ac22e',
  Omastadi = '9defdb0d-eea4-40fc-b283-30e1be14e163',
  ProjectArea = '05552ebb-aec8-4ca7-b2e1-dea66b0b07ce',
  Park = 'bcfe8874-5de1-49e8-a5b1-45b363a28222',
}

export enum ProjectPhase {
  Proposal = 'a92787d2-43e3-41c5-abee-74657f9ecd8f',
  Design = 'e5b354bb-90e4-4d5d-a03b-7cbff71183b9',
  Programming = 'ae662f9b-4388-4093-aa0d-14bd9fbaf875',
  DraftInitiation = '4805da24-76a4-4865-8c90-64a6702f3a94',
  DraftApproval = 'c6f389b1-075e-4e18-bd9a-c913502141d9',
  ConstructionPlan = '59b8ac24-562a-47cd-93ce-e243ba36a793',
  ConstructionWait = '4decc8f7-7481-4ab8-b161-aff761720e0f',
  Construction = '01f934b5-3ba8-47f5-994e-7fef67185fff',
  WarrantyPeriod = 'ecfc57f3-4d71-4d5a-b8e6-372c20de3533',
  Completed = '4d9fbaf7-ea91-4c1a-aaf8-90dd575054f3',
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
