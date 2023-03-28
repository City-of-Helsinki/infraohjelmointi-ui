import { ReactNode } from 'react';

export interface IError {
  status: number | undefined;
  message: string;
}

export interface INavigationItem {
  route: string;
  label: string;
  component?: ReactNode;
}

export interface IOption {
  label: string;
  value: string;
  name?: string;
}

export interface INotification {
  message?: string;
  type?: NotificationType;
  status?: string;
  title?: string;
  duration?: number;
}

export interface IListItem {
  id: string;
  value: string;
}

export type ListType =
  | 'types'
  | 'phases'
  | 'areas'
  | 'phaseDetails'
  | 'categories'
  | 'masterClasses'
  | 'classes'
  | 'subClasses'
  | 'districts'
  | 'divisions'
  | 'subDivisions'
  | 'responsibleZones'
  | 'responsiblePersons'
  | 'constructionPhaseDetails'
  | 'riskAssessments'
  | 'projectQualityLevels'
  | 'planningPhases'
  | 'constructionPhases'
  | 'programmedYears';

export type NotificationType = 'notification' | 'toast';
export type NotificationColorType = 'error' | 'info' | 'success';
export type SelectCallback = (selected: IOption) => void;
export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light';
export type IconSizeType = 'xl' | 'l' | 'm' | 's' | 'xs';
export type InputSizeType = 'l' | 'm';

export enum ClassTableHierarchy {
  First = 'first',
  Second = 'second',
  Third = 'third',
}

export interface IFreeSearchResults {
  hashtags: Array<IListItem>;
  projects: Array<IListItem>;
  groups: Array<IListItem>;
}

export interface IContextMenuData {
  title: string;
  year: number;
  cellType: CellType;
  menuType: ContextMenuType;
  onRemoveCell?: () => void;
  onEditCell?: () => void;
}

export type FreeSearchFormItem = IOption & { type: string };
export type FreeSearchFormObject = { [k: string]: FreeSearchFormItem };

export type CellType =
  | 'planning'
  | 'construction'
  | 'overlap'
  | 'none'
  | 'estPlanningStart'
  | 'estPlanningEnd'
  | 'estConstructionStart'
  | 'estConstructionEnd';
export enum ContextMenuType {
  EDIT_PROJECT_CELL,
}
