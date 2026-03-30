import { IListState } from '@/reducers/listsSlice';

const ADMIN_MENUS_MENU_TYPE = [
  'categories',
  'types',
  'programs',
  'phases',
  'projectPhaseDetails',
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
  | 'phases'
  | 'projectPhaseDetails'
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
  firstNameInputLabel: string;
  lastNameInputLabel: string;
  emailInputLabel: string;
  phoneNumberInputLabel: string;
  valueInputLabel: string;
  titleInputLabel: string;
}

type DialogMode = 'add' | 'edit';

interface DialogState {
  open: boolean;
  mode: DialogMode;
  value: string;
  path: string;
  editableItemId: string;
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
    editableItemId: string,
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

interface MenuItemPatchThunkContent {
  request: MenuItemRequest;
  path: string;
  id: string;
  listType: ReorderableListType;
}

interface MenuItemPostThunkContent {
  request: MenuItemRequest;
  path: string;
  listType: ReorderableListType;
}

interface PersonTypeMenuItemRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
}

interface PersonTypeMenuItemPatchThunkContent {
  request: PersonTypeMenuItemRequest;
  path: string;
  id: string;
  listType: ReorderableListType;
}

interface PersonTypeMenuItemPostThunkContent {
  request: PersonTypeMenuItemRequest;
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
  MenuItemRequest,
  PersonTypeMenuItemRequest,
  PersonTypeMenuItemPatchThunkContent,
  PersonTypeMenuItemPostThunkContent,
  MenuItemPatchThunkContent,
  MenuItemPostThunkContent,
  MoveRowPayload,
  ReorderableListType,
  PersonTypeDialogValues,
};
