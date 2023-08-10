import { IClass } from './classInterfaces';
import { IGroup } from './groupInterfaces';
import { ILocation } from './locationInterfaces';
import { CellType, IProject, IProjectRequest } from './projectInterfaces';

export enum ContextMenuType {
  EDIT_PROJECT_CELL,
  EDIT_PROJECT_PHASE,
  NEW_ITEM,
  EDIT_GROUP_ROW,
}

export interface ICellMenuDetails {
  title: string;
  year: number;
  cellType: CellType;
  onRemoveCell: () => void;
  onEditCell: () => void;
  onUpdateCellType: (phase: string) => void;
  canTypeUpdate: boolean;
}

export interface IPhaseMenuDetails {
  title: string;
  phase?: string;
  onSubmitPhase: (req: IProjectRequest) => void;
}

export interface INewItemMenuDetails {
  onShowGroupDialog: () => void;
  onShowProjectProgrammedDialog: () => void;
  onOpenNewProjectForm: () => void;
}

export interface GroupRowMenuDetails {
  groupName: string;
  onShowGroupDeleteDialog: () => void;
  onShowGroupEditDialog: () => void;
}
export interface IContextMenuData {
  menuType: ContextMenuType;
  cellMenuProps?: ICellMenuDetails;
  phaseMenuProps?: IPhaseMenuDetails;
  newItemsMenuProps?: INewItemMenuDetails;
  groupRowMenuProps?: GroupRowMenuDetails;
}

export interface ITooltipEventData {
  text: string;
}

interface IFinancePlanningData {
  masterClass: IClass | null;
  class: IClass | null;
  subClass: IClass | null;
  district: ILocation | null;
  group: IGroup | null;
}

interface IFinanceCoordinationData extends Omit<IFinancePlanningData, 'group'> {
  collectiveSubLevel: IClass | null;
  otherClassification: IClass | null;
  otherClassificationSubLevel: IClass | null;
}

export interface IFinanceEventData {
  planning: IFinancePlanningData;
  coordination: IFinanceCoordinationData;
}

export interface IProjectEventData {
  project: IProject;
}
