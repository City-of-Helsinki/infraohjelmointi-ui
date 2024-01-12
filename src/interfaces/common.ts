import { ReactNode } from 'react';

interface IDjangoError {
  attr: string;
  code: string;
  detail: string;
}

export interface IErrorResponse {
  errors: Array<IDjangoError>;
  type: string;
}

export interface IError {
  status: number | undefined;
  message: string;
  errors?: Array<IDjangoError>;
  type?: string;
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
  parent?: string;
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
  | 'programmedYears'
  | 'projectDistricts'
  | 'projectSubDistricts'
  | 'projectSubSubDistricts';

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

export interface ICoordinatorRequestParams {
  forcedToFrame: boolean;
  year: number;
}
