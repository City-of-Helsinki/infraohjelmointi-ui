import { IListState } from '@/reducers/listsSlice';
import { DialogMode, IListItem } from './common';
import { IPerson } from './personsInterfaces';

const ADMIN_MENUS_MENU_TYPE = [
  'categories',
  'types',
  'programs',
  'constructionProcurementMethods',
  'staraProcurementReasons',
  'projectQualityLevels',
  'planningPhases',
  'constructionPhases',
  'responsibleZones',
  'responsiblePersonsRaw',
  'programmersRaw',
  'budgetOverrunReasons',
] as const;

type AdminMenusMenuType = (typeof ADMIN_MENUS_MENU_TYPE)[number];

type ReorderableListType = keyof Pick<
  IListState,
  | 'types'
  | 'constructionProcurementMethods'
  | 'staraProcurementReasons'
  | 'categories'
  | 'projectQualityLevels'
  | 'budgetOverrunReasons'
  | 'constructionPhases'
  | 'planningPhases'
  | 'responsiblePersonsRaw'
  | 'responsibleZones'
  | 'programmersRaw'
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
}

interface DialogState {
  open: boolean;
  mode: DialogMode;
  value: string;
  path: string;
  menuItemId: string;
  personTypeDialogValues?: PersonTypeDialogValues;
  listType?: ReorderableListType;
}

interface PersonTypeDialogValues {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  phone?: string;
}

interface AdminMenusCardProps {
  listType: ReorderableListType;
  onEditMenuItem: (
    value: string,
    menuItemId: string,
    path: string,
    listType: ReorderableListType,
  ) => void;
  onDeleteMenuItem: (
    value: string,
    menuItemId: string,
    path: string,
    listType: ReorderableListType,
  ) => void;
  onAddMenuItem: (path: string, listType: ReorderableListType) => void;
  path: string;
  useUntranslatedValues?: boolean;
}

interface IAdminMenuOrderCellProps {
  rowIndex: number;
  listType: ReorderableListType;
  rowLength: number;
  id: string;
  path: string;
}

interface MenuItemRequest {
  value: string;
}

interface PersonTypeMenuItemRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
}

// listType is not sent to the backend; listsSlice uses it to sync the matching list.
interface MenuItemPostArgs {
  request: MenuItemRequest | PersonTypeMenuItemRequest;
  path: string;
  listType: ReorderableListType;
}

interface MenuItemPatchArgs extends MenuItemPostArgs {
  id: string;
}

interface MenuItemDeleteArgs {
  path: string;
  id: string;
  listType: ReorderableListType;
}

interface MenuItemOrderArgs {
  request: IListItem[] | IPerson[];
  path: string;
}

interface MoveRowPayload {
  listType: ReorderableListType;
  rowId: string;
  direction: 'up' | 'down';
}

interface DeleteRowPayload {
  listType: ReorderableListType;
  rowId: string;
}

export { ADMIN_MENUS_MENU_TYPE };
export type {
  AdminMenusCardProps,
  AdminMenusMenuType,
  MenuItemDialogMessages,
  DeleteRowPayload,
  DialogMode,
  DialogState,
  IAdminMenuOrderCellProps,
  MenuItemRequest,
  MenuItemDeleteArgs,
  MenuItemOrderArgs,
  PersonTypeMenuItemRequest,
  MenuItemPatchArgs,
  MenuItemPostArgs,
  MoveRowPayload,
  ReorderableListType,
  PersonTypeDialogValues,
};
