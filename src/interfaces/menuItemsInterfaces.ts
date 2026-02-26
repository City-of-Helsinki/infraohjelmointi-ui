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

type ReorderableListType = keyof Pick<
  IListState,
  | 'types'
  | 'phases'
  | 'constructionPhaseDetails'
  | 'constructionProcurementMethods'
  | 'categories'
  | 'projectQualityLevels'
  | 'budgetOverrunReasons'
  | 'constructionPhases'
  | 'planningPhases'
  | 'responsiblePersons'
  | 'responsibleZones'
  | 'programmers'
>;

interface MenuItemDialogMessages {
  submitSuccessTitle: string;
  submitSuccessMessage: string;
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
  listType?: ReorderableListType;
}

interface AdminMenusCardProps {
  listType: ReorderableListType;
  translateValues: boolean;
  onEditMenuItem: (
    value: string,
    editableItemId: string,
    path: string,
    listType: ReorderableListType,
  ) => void;
  onAddMenuItem: (path: string, listType: ReorderableListType) => void;
  path: string;
}

interface IAdminMenuOrderCellProps {
  rowIndex: number;
  listType: ReorderableListType;
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
  listType: ReorderableListType;
}

interface MenuItemPostThunkContent {
  request: MenuItemPostRequest;
  path: string;
  listType: ReorderableListType;
}

interface MoveRowPayload {
  listType: ReorderableListType;
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
  ReorderableListType,
};
