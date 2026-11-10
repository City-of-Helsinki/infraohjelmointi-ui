export const adminFunctions = [
  'hashtags',
  'menus',
  'auditlog',
  'financialstatements',
  'forcedtoframestate',
  'personaldataretention',
] as const;

export type AdminFunctionType = (typeof adminFunctions)[number];

export interface IAppStateValue {
  id: string;
  name: string;
  value: boolean;
  updatedDate: string;
}
