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

export interface IOptionType {
  label: string;
}

export interface INotification {
  message: string;
  type?: NotificationType;
  status?: string;
  title?: string;
}

export type NotificationType = 'notification' | 'toast';
export type NotificationColorType = 'error' | 'info' | 'success';
export type SelectCallback = (selected: IOptionType) => void;
export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light';
export type IconSizeType = 'xl' | 'l' | 'm' | 's' | 'xs';
export type InputSizeType = 'l' | 'm';
