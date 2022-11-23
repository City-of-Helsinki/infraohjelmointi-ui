export interface IProjectCard {
  id: string;
  projectReadiness: number;
  hkrId: string;
  sapProject: string;
  sapNetwork: string;
  type: ProjectType;
  name: string;
  entityName: string;
  description: string;
  phase: ProjectPhase;
  programmed: boolean;
  constructionPhaseDetail: string;
  estPlanningStartYear: string;
  estDesignEndYear: string;
  estDesignStartDate: string;
  estDesignEndDate: string;
  contractPrepStartDate: string;
  contractPrepEndDate: string;
  warrantyStartDate: string;
  warrantyExpireDate: string;
  perfAmount: string;
  unitCost: string;
  costForecast: string;
  neighborhood: string;
  comittedCost: string;
  tiedCurrYear: string;
  realizedCost: string;
  spentCost: string;
  riskAssess: string;
  priority: ProjectPriority;
  locked: boolean;
  comments: string;
  delays: string;
  createdDate: string;
  updatedDate: string;
  siteId: IBudget | null;
  projectSet: IProjectSet | null;
  area: IProjectArea | null;
  personPlanning: IPerson | null;
  personProgramming: IPerson | null;
  personConstruction: IPerson | null;
  favPersons: Array<string>;
}

export interface IProjectCardRequest {
  // type: string;
  description: string;
  entityName: string;
}

export interface IProjectCardRequestObject {
  id?: string;
  data: IProjectCardRequest;
}

export enum ProjectType {
  ProjectComplex = 'projectComplex',
  Street = 'street',
  Traffic = 'traffic',
  Sports = 'sports',
  Omastadi = 'omaStadi',
  ProjectArea = 'projectArea',
  Park = 'park',
}

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
  projectPhase: ProjectPhase;
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
