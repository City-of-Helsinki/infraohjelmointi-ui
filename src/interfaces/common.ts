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
}

export interface INotification {
  message: string;
  type?: NotificationType;
  status?: string;
  title?: string;
}

export interface IListItem {
  id: string;
  value: string;
}

export type ListType = 'type' | 'phase';

export type NotificationType = 'notification' | 'toast';
export type NotificationColorType = 'error' | 'info' | 'success';
export type SelectCallback = (selected: IOption) => void;
export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light';
export type IconSizeType = 'xl' | 'l' | 'm' | 's' | 'xs';
export type InputSizeType = 'l' | 'm';
