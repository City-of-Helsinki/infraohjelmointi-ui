import { IListItem } from './common';
import { AppDispatch } from '@/store';
import { DialogMode } from './menuItemsInterfaces';
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
  constructionProcurementMethod: IListItem | null;
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
  constructionHandoverFinancing: IConstructionHandoverFinancing[];
}

export interface IConstructionHandoverRequest
  extends Omit<
    IConstructionHandover,
    'id' | 'status' | 'constructionProcurementMethod' | 'personPlanning' | 'personFinancing' | 'constructionHandoverFinancing'
  > {
  project: string;
  constructionProcurementMethod: string;
  personPlanning: string;
  personFinancing: string;
}

export interface IConstructionHandoverPatchRequest {
  id: string;
  data: IConstructionHandoverRequest;
}

export interface IConstructionHandoverTransitionResponse {
  currentStatus: ConstructionHandoverStatus;
  possibleTransitions: ConstructionHandoverStatus[];
}
export interface FinancingDialogState {
  open: boolean;
  mode: DialogMode;
  itemId: string;
  values?: FinancingRowValues;
}

export interface FinancingRowValues {
  financer: string;
  description: string;
  budgetItem: string;
  projectNumber: string;
  budget: string;
  id: string;
}

export interface IConstructionHandoverFinancing {
  id: string;
  financingParty: string;
  description?: string;
  budgetItem:
    | string
    | {
        id?: string;
        value?: string;
        name?: string;
        site?: string;
        siteName?: string;
      }
    | null;
  projectNumber: string;
  budget: string | number | null;
}

export interface FinancingRowPostAndPatchThunkContent {
  request: FinancingRowValues;
}

export interface FinancingRowRequest {
  handover?: string;
  project?: string;
  financingParty: string;
  description?: string;
  budgetItemId?: string | null;
  projectNumber: string;
  budget: string;
}

export interface FinancingRowDeleteThunkContent {
  dispatch: AppDispatch;
  id: string;
}
