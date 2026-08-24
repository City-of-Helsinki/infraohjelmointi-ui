import { IListItem } from './common';
import type { AppDispatch } from '@/store';
import type { DialogMode } from './menuItemsInterfaces';
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
  staraProcurementReason: IListItem | null;
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
    | 'id'
    | 'project'
    | 'status'
    | 'constructionProcurementMethod'
    | 'staraProcurementReason'
    | 'personPlanning'
    | 'personFinancing'
    | 'constructionHandoverFinancing'
    | 'constructionProjectManager'
  > {
  constructionProcurementMethod: string;
  staraProcurementReason: string | null;
  personPlanning: string;
  personFinancing: string;
  constructionProjectManager?: string;
}

export interface IConstructionHandoverPatchRequest {
  id: string;
  data: Partial<IConstructionHandoverRequest>;
}

export interface IConstructionHandoverTransitionResponse {
  currentStatus: ConstructionHandoverStatus;
  possibleTransitions: ConstructionHandoverStatus[];
}

// IO-883: a single change event from GET /construction-handovers/{id}/history/
// (IO-882). Relations are already resolved server-side to display strings
// (person names, related-row `value`, ISO dates), so no id→name lookup is needed
// here. Mirrors the project-history feed shape (IProjectHistoryEntry).
export interface IConstructionHandoverHistoryEntry {
  id: string;
  actor: string | null;
  actor_username: string | null;
  actor_first_name: string | null;
  actor_last_name: string | null;
  operation: 'CREATE' | 'UPDATE';
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  changed_fields: Array<string>;
  createdDate: string | null;
}

export interface IConstructionHandoverHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<IConstructionHandoverHistoryEntry>;
}

export interface IConstructionHandoverHistoryRequest {
  handoverId: string;
  pageSize?: number;
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
  budgetItem: IListItem | null;
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

export type OnFinancingRowSaved = (row: FinancingRowValues, mode: DialogMode) => void;

export type OnFinancingRowDeleted = (id: string) => void;

export interface FinancingDialogBaseProps {
  dialogState: FinancingDialogState;
  handleClose: () => void;
}

export interface FinancingDialogModifyProps extends FinancingDialogBaseProps {
  onRowSaved: OnFinancingRowSaved;
}

export interface FinancingDialogDeleteProps extends FinancingDialogBaseProps {
  onRowDeleted: OnFinancingRowDeleted;
}

export interface FinancingDialogProps extends FinancingDialogBaseProps {
  onRowSaved: OnFinancingRowSaved;
  onRowDeleted: OnFinancingRowDeleted;
}
