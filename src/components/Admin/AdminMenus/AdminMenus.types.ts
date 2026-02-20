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
