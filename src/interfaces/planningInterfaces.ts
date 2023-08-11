import { IClass } from './classInterfaces';
import { IGroup } from './groupInterfaces';
import { ILocation } from './locationInterfaces';
import { IProject } from './projectInterfaces';

// This types are used to create search params and style the rows differently
export type PlanningRowType =
  | 'masterClass'
  | 'class'
  | 'subClass'
  | 'subClassDistrict' // type used for subClasses when they have "suurpiiri" or "östersundom" in their name and have to act like districts
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
  budgetChange?: string;
  year: number;
  isCurrentYear: boolean;
  isFrameBudgetOverlap: boolean;
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

export interface IPlanningSearchParams {
  masterClass?: string;
  class?: string;
  subClass?: string;
  collectiveSubLevel?: string;
  otherClassification?: string;
  otherClassificationSubLevel?: string;
  district?: string;
  subLevelDistrict?: string;
}
