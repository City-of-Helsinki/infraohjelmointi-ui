const IADMIN_MENUS_MENU_TYPE = [
  'category',
  'type',
  'program',
  'phase',
  'projectPhaseSpesification',
  'constructionPhaseDetail',
  'constructionProcurementMethod',
  'projectCost',
  'planningCostEstimate',
  'buildingCostEstimate',
  'responsibleZone',
  'responsiblePersonsList',
  'programmer',
  'budgetOverrunReason',
] as const;

type IAdminMenusMenuType = (typeof IADMIN_MENUS_MENU_TYPE)[number];

export { IADMIN_MENUS_MENU_TYPE };
export type { IAdminMenusMenuType };
