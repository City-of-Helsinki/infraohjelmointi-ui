export const adminFunctions = ['hashtags', 'menus', 'auditlog', 'financialstatements', 'forcedtoframestate'] as const;

export type AdminFunctionType = (typeof adminFunctions)[number];
