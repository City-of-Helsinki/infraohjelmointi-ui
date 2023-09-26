export const adminFunctions = ['hashtags', 'menus', 'auditlog', 'financialstatements'] as const;

export type AdminFunctionType = (typeof adminFunctions)[number];
