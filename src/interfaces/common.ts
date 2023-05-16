import { ReactNode } from 'react';
import { IProject } from './projectInterfaces';
import { IClass } from './classInterfaces';
import { ILocation } from './locationInterfaces';
import { IGroup } from './groupInterfaces';

export interface IError {
  status: number | undefined;
  message: string;
}

export interface INavigationItem {
  route: string;
  label: string;
  component?: ReactNode;
  disabled?: boolean;
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

type NotificationType = 'notification' | 'toast';
export type NotificationColorType = 'error' | 'info' | 'success';
export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light' | 'medium';
export type IconSizeType = 'xl' | 'l' | 'm' | 's' | 'xs';

export interface IFreeSearchResults {
  hashtags: Array<IListItem>;
  projects: Array<IListItem>;
  groups: Array<IListItem>;
}

export type FreeSearchFormItem = IOption & { type: string };
export type FreeSearchFormObject = { [k: string]: FreeSearchFormItem };

export type PlanningRowType =
  | 'masterClass'
  | 'class'
  | 'subClass'
  | 'district-preview'
  | 'district'
  | 'division'
  | 'group'
  | 'project';

export interface IProjectSums {
  availableFrameBudget: string;
  costEstimateBudget: string;
}

export interface IPlanningSums {
  plannedBudgets?: string;
  costEstimateBudget?: string;
  deviation?: string;
}

export interface IPlanningCell {
  key: string;
  deviation?: string;
  plannedBudget?: string;
  frameBudget?: string;
  year: number;
  isStartMonth: boolean;
}

export interface IPlanningRowLists {
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  districts: Array<ILocation>;
  divisions: Array<ILocation>;
  groups: Array<IGroup>;
}

export interface IPlanningRowSelections {
  selectedMasterClass: IClass | null;
  selectedClass: IClass | null;
  selectedSubClass: IClass | null;
  selectedDistrict: ILocation | null;
}

export interface IPlanningRow extends IPlanningSums {
  type: PlanningRowType;
  name: string;
  path: string;
  children: Array<IPlanningRow>;
  projectRows: Array<IProject>;
  id: string;
  key: string;
  defaultExpanded: boolean;
  link: string | null;
  cells: Array<IPlanningCell>;
}
