import { IClass } from './classInterfaces';
import { IGroup } from './groupInterfaces';
import { ILocation } from './locationInterfaces';
import { CellType, IProject, IProjectRequest } from './projectInterfaces';

export enum ContextMenuType {
  EDIT_PROJECT_CELL,
  EDIT_PROJECT_PHASE,
  NEW_ITEM,
}

export interface ICellMenuDetails {
  title: string;
  year: number;
  cellType: CellType;
  onRemoveCell: () => void;
  onEditCell: () => void;
}

export interface IPhaseMenuDetails {
  title: string;
  phase?: string;
  onSubmitPhase: (req: IProjectRequest) => void;
}

export interface INewItemMenuDetails {
  onShowGroupDialog: () => void;
  onShowProjectProgrammedDialog: () => void;
}

export interface IContextMenuData {
  menuType: ContextMenuType;
  cellMenuProps?: ICellMenuDetails;
  phaseMenuProps?: IPhaseMenuDetails;
  newItemsMenuProps?: INewItemMenuDetails;
}

export interface IFinanceEventData {
  masterClass: IClass | null;
  class: IClass | null;
  subClass: IClass | null;
  district: ILocation | null;
  group: IGroup | null;
  project: IProject | null;
}

export interface IProjectEventData {
  project: IProject;
}
