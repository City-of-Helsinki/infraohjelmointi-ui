export const adminFunctions = [
  'hashtags',
  'menus',
  'auditlog',
  'financialstatements',
  'forcedtoframestate',
] as const;

export type AdminFunctionType = (typeof adminFunctions)[number];

export interface IAppStateValue {
  id: string;
  name: string;
  value: boolean;
  updatedDate: string;
}
