import { ReactNode } from 'react';
import { CellType, IProject, IProjectRequest } from './projectInterfaces';
import { IClass } from './classInterfaces';
import { ILocation } from './locationInterfaces';
import { IGroup } from './groupInterfaces';
import { ContextMenuType } from './eventInterfaces';

export interface IError {
  status: number | undefined;
  message: string;
}

export interface INavigationItem {
  route: string;
  label: string;
  component?: ReactNode;
  disabled?: boolean;
}

export interface IOption {
  label: string;
  value: string;
  name?: string;
}

export interface INotification {
  message?: string;
  type?: NotificationType;
  status?: string;
  title?: string;
  duration?: number;
}

export interface IListItem {
  id: string;
  value: string;
}

export type ListType =
  | 'types'
  | 'phases'
  | 'areas'
  | 'phaseDetails'
  | 'categories'
  | 'masterClasses'
  | 'classes'
  | 'subClasses'
  | 'districts'
  | 'divisions'
  | 'subDivisions'
  | 'responsibleZones'
  | 'responsiblePersons'
  | 'constructionPhaseDetails'
  | 'riskAssessments'
  | 'projectQualityLevels'
  | 'planningPhases'
  | 'constructionPhases'
  | 'programmedYears';

type NotificationType = 'notification' | 'toast';
export type NotificationColorType = 'error' | 'info' | 'success';
export type TextColorType = 'black' | 'white';
export type FontWeightType = 'bold' | 'light' | 'medium';
export type IconSizeType = 'xl' | 'l' | 'm' | 's' | 'xs';

export interface IFreeSearchResults {
  hashtags: Array<IListItem>;
  projects: Array<IListItem>;
  groups: Array<IListItem>;
}

export interface ICellMenuDetails {
  title: string;
  year: number;
  cellType: CellType;
  onRemoveCell: () => void;
  onEditCell: () => void;
  onUpdateCellPhase: (phase: string) => void;
}

export interface IPhaseMenuDetails {
  title: string;
  phase?: string;
  onSubmitPhase: (req: IProjectRequest) => void;
}

export interface IContextMenuData {
  menuType: ContextMenuType;
  cellMenuProps?: ICellMenuDetails;
  phaseMenuProps?: IPhaseMenuDetails;
}

export type FreeSearchFormItem = IOption & { type: string };
export type FreeSearchFormObject = { [k: string]: FreeSearchFormItem };

// This types are used to create search params and style the rows differently
export type PlanningRowType =
  | 'masterClass'
  | 'class'
  | 'subClass'
  | 'subClassDistrict'
  | 'district' // type used for districts when there is a selectedDistrict
  | 'districtPreview' // type used for districts when there are multiple districts
  | 'collectiveSubLevel'
  | 'subLevelDistrict' // type used for districts when the district is after the selectedCollectiveSubLevel
  | 'otherClassification'
  | 'otherClassificationSubLevel'
  | 'division'
  | 'group'
  | 'project';

export interface IProjectSums {
  availableFrameBudget: string;
  costEstimateBudget: string;
}

export interface IPlanningSums {
  plannedBudgets?: string;
  costEstimateBudget?: string;
  deviation?: string;
}

export interface IPlanningCell {
  key: string;
  deviation?: string;
  plannedBudget?: string;
  frameBudget?: string;
  year: number;
  isCurrentYear: boolean;
}

export interface IPlanningRowList {
  masterClasses: Array<IClass>;
  classes: Array<IClass>;
  subClasses: Array<IClass>;
  collectiveSubLevels: Array<IClass>;
  districts: Array<ILocation>;
  otherClassifications: Array<IClass>;
  otherClassificationSubLevels: Array<IClass>;
  divisions: Array<ILocation>;
  groups: Array<IGroup>;
}

export interface IPlanningRowSelections {
  selectedMasterClass: IClass | null;
  selectedClass: IClass | null;
  selectedSubClass: IClass | null;
  selectedDistrict: ILocation | null;
  selectedCollectiveSubLevel: IClass | null;
  selectedSubLevelDistrict: ILocation | null;
  selectedOtherClassification: IClass | null;
}

export interface IPlanningRow extends IPlanningSums {
  type: PlanningRowType;
  name: string;
  path: string;
  children: Array<IPlanningRow>;
  projectRows: Array<IProject>;
  id: string;
  key: string;
  defaultExpanded: boolean;
  urlSearchParam: { [key: string]: string } | null;
  cells: Array<IPlanningCell>;
}

export type PlanningMode = 'planning' | 'coordination';
