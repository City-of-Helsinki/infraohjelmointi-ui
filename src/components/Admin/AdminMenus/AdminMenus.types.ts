const IADMIN_MENUS_MENU_TYPE = [
  'category',
  'type',
  'program',
  'phase',
  'projectPhaseSpesification',
  'constructionPhaseDetail',
  'constructionProcurementMethod',
  'projectQualityLevel',
  'planningPhase',
  'constructionPhase',
  'responsibleZone',
  'responsiblePersonsList',
  'programmer',
  'budgetOverrunReason',
] as const;

// const IADMIN_MENUS_MENU_TYPE_AS_CONST = {
//   CATEGORY: 'category',
//   TYPE: 'type',
//   PROGRAM: 'program',
//   PHASE: 'phase',
//   PROJECT_PHASE_SPESIFICATION: 'projectPhaseSpesification',
//   CONSTRUCTION_PHASE_DETAIL: 'constructionPhaseDetail',
//   CONSTRUCTION_PROCUREMENT_METHOD: 'constructionProcurementMethod',
//   PROJECT_QUALITY_LEVEL: 'projectQualityLevel',
//   PLANNING_PHASE: 'planningPhase',
//   CONSTRUCTION_PHASE: 'constructionPhase',
//   RESPONSIBLE_ZONE: 'responsibleZone',
//   RESPONSIBLE_PERSONS_LIST: 'responsiblePersonsList',
//   PROGRAMMER: 'programmer',
//   BUDGET_OVERRUN_REASON: 'budgetOverrunReason',
// } as const;

type IAdminMenusMenuType = (typeof IADMIN_MENUS_MENU_TYPE)[number];

interface MenuItemDialogMessages {
  submitSuccess: string;
  submitError: string;
  dialogId: string;
  titleId: string;
  descriptionId: string;
  closeButtonLabelText: string;
  dialogHeader: string;
  dialogInputId: string;
  inputLabel: string;
}

type DialogMode = 'add' | 'edit';

interface DialogState {
  open: boolean;
  mode: DialogMode;
  value: string;
  menuType?: string;
  rowIndex?: number;
}

export { IADMIN_MENUS_MENU_TYPE };
export type { IAdminMenusMenuType, MenuItemDialogMessages, DialogMode, DialogState };
