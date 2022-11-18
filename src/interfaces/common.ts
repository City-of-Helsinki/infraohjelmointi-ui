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

export type NotificationType = 'error' | 'info';

export interface INotification {
  message: string | null;
  type: NotificationType | null;
  status?: string | null;
  title?: string | null;
}

export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light';
