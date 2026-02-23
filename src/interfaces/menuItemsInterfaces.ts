import { IListState } from '@/reducers/listsSlice';

const IADMIN_MENUS_MENU_TYPE = [
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
  path: string;
  editableItemId: string;
  rowIndex?: number;
}

interface IAdminMenusCardProps {
  listType: keyof Omit<IListState, 'error'>;
  translateValues: boolean;
  onEditMenuItem: (value: string, rowIndex: number, editableItemId: string, path: string) => void;
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

interface IMenuItemPatchRequest {
  data: string;
  id: string;
}

interface IMenuItemPostRequest {
  value: string;
}

interface IMenuItemPatchThunkContent {
  request: IMenuItemPatchRequest;
  path: string;
}

interface IMenuItemPostThunkContent {
  request: IMenuItemPostRequest;
  path: string;
}

interface MoveRowPayload {
  listType: keyof Omit<IListState, 'error'>;
  rowId: string;
  direction: 'up' | 'down';
}

export { IADMIN_MENUS_MENU_TYPE };
export type {
  IAdminMenusCardProps,
  IAdminMenusMenuType,
  MenuItemDialogMessages,
  DialogMode,
  DialogState,
  IAdminMenuOrderCellProps,
  IMenuItemPatchRequest,
  IMenuItemPostRequest,
  IMenuItemPatchThunkContent,
  IMenuItemPostThunkContent,
  MoveRowPayload,
};
