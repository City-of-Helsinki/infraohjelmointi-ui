import { IListState } from '@/reducers/listsSlice';

const ADMIN_MENUS_MENU_TYPE = [
  'categories',
  'types',
  'programs',
  'phases',
  'constructionPhaseDetails',
  'constructionProcurementMethods',
  'projectQualityLevels',
  'planningPhases',
  'constructionPhases',
  'responsibleZones',
  'responsiblePersons',
  'programmers',
  'budgetOverrunReasons',
] as const;

type AdminMenusMenuType = (typeof ADMIN_MENUS_MENU_TYPE)[number];

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
  path: string;
  editableItemId: string;
}

interface AdminMenusCardProps {
  listType: keyof Omit<IListState, 'error'>;
  translateValues: boolean;
  onEditMenuItem: (value: string, editableItemId: string, path: string) => void;
  onAddMenuItem: (path: string) => void;
  path: string;
}

interface IAdminMenuOrderCellProps {
  rowIndex: number;
  listType: keyof Omit<IListState, 'error'>;
  rowLength: number;
  id: string;
  path: string;
}

interface MenuItemPatchRequest {
  value: string;
  id: string;
}

interface MenuItemPostRequest {
  value: string;
}

interface MenuItemPatchThunkContent {
  request: MenuItemPatchRequest;
  path: string;
}

interface MenuItemPostThunkContent {
  request: MenuItemPostRequest;
  path: string;
}

interface MoveRowPayload {
  listType: keyof Omit<IListState, 'error'>;
  rowId: string;
  direction: 'up' | 'down';
}

export { ADMIN_MENUS_MENU_TYPE };
export type {
  AdminMenusCardProps,
  AdminMenusMenuType,
  MenuItemDialogMessages,
  DialogMode,
  DialogState,
  IAdminMenuOrderCellProps,
  MenuItemPatchRequest,
  MenuItemPostRequest,
  MenuItemPatchThunkContent,
  MenuItemPostThunkContent,
  MoveRowPayload,
};
