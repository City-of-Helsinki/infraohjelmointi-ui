export const adminFunctions = ['hashTags', 'menus', 'auditLog', 'financialStatements'] as const;

export type AdminFunctionType = (typeof adminFunctions)[number];
