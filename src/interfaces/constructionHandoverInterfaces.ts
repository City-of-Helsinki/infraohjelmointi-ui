import { IPerson } from './personsInterfaces';

export enum ConstructionHandoverStatus {
  DRAFT = 'DRAFT',
  SUBMITTED_TO_PROGRAMMER = 'SUBMITTED_TO_PROGRAMMER',
  SUBMITTED_TO_CONSTRUCTION = 'SUBMITTED_TO_CONSTRUCTION',
  PROJECT_MANAGER_NAMED = 'PROJECT_MANAGER_NAMED',
  MOVED_TO_CONSTRUCTION_PREPARATION = 'MOVED_TO_CONSTRUCTION_PREPARATION',
}

export interface IConstructionHandover {
  id: string;
  project: string;
  status: ConstructionHandoverStatus;
  name: string | null;
  description: string | null;
  constructionProcurementMethod: string | null;
  constructionStart: string | null;
  constructionEnd: string | null;
  otherTimelineNotes: string;
  totalCost: number | null;
  personPlanning: IPerson | null;
  personFinancing: IPerson | null;
  linkDesignDrawings: string | null;
  linkCostAllocation: string | null;
  linkContractBoundaries: string | null;
  constructionProjectManager: IPerson | null;
}
