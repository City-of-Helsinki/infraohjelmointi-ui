import { IconSize } from 'hds-react';
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
  parameter?: string;
}

export interface IListItem {
  id: string;
  value: string;
  parent?: string;
  index?: number;
}

export type ListType =
  | 'types'
  | 'typeQualifiers'
  | 'phases'
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
  | 'projectPhaseDetails'
  | 'constructionProcurementMethods'
  | 'projectQualityLevels'
  | 'planningPhases'
  | 'constructionPhases'
  | 'programmedYears'
  | 'projectDistricts'
  | 'projectSubDistricts'
  | 'projectSubSubDistricts'
  | 'budgetOverrunReasons'
  | 'programmers'
  | 'priorities';

type NotificationType = 'notification' | 'toast';
export type NotificationColorType = 'error' | 'info' | 'success';
export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light' | 'medium';
export type IconSizeType =
  | IconSize.ExtraLarge
  | IconSize.Large
  | IconSize.Medium
  | IconSize.Small
  | IconSize.ExtraSmall;

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
