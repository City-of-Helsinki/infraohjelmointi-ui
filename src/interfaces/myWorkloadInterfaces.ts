import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';
import type { TableProps } from 'hds-react';
import type { Control, UseFormGetValues } from 'react-hook-form';
import { IProjectTask, ProjectTaskType } from './projectInterfaces';

export interface MyWorkloadDateFieldProps {
  id: string;
  label: string;
  name: MyWorkloadDateFieldName;
  required?: boolean;
  control: Control<IMyWorkloadEditFormValues>;
  getValues: UseFormGetValues<IMyWorkloadEditFormValues>;
  containerRef: RefObject<HTMLDivElement | null>;
}

export interface MyWorkloadPhaseCellProps {
  phaseInfo: PhaseInfo;
}

export interface MyWorkloadFunctionsCellProps {
  row: MyWorkloadTableRow;
  label: string;
  onEdit: (row: MyWorkloadTableRow) => void;
}

export interface MyWorkloadTasksProps {
  listOfTasks: IProjectTask[];
}

export interface MyWorkloadTaskCardProps {
  task: MyWorkloadTaskItem;
}

export interface MyWorkloadViewTypeButtonsProps {
  viewType: MyWorkloadViewType;
  setViewType: Dispatch<SetStateAction<MyWorkloadViewType>>;
}

export interface MyWorkloadEditDialogProps {
  isOpen: boolean;
  project: MyWorkloadTableRow | null;
  viewType: MyWorkloadViewType;
  onClose: () => void;
  onSave: (row: MyWorkloadTableRow) => void;
}

export type MyWorkloadSortCompare = (valueA: unknown, valueB: unknown) => number;

export type MyWorkloadTableColumn = TableProps['cols'][number] & {
  customSortCompareFunction?: MyWorkloadSortCompare;
};

export type MyWorkloadSortState = {
  colKey: keyof MyWorkloadTableRow;
  order: 'asc' | 'desc';
} | null;

export interface MyWorkloadPhaseSortValue {
  value: string;
  constructionStart: string;
}

export interface IMyWorkloadEditFormValues {
  planningStart: string;
  planningEnd: string;
  presenceStart: string;
  presenceEnd: string;
  visibilityStart: string;
  visibilityEnd: string;
  constructionStart: string;
  constructionEnd: string;
  planningCostForecast: string;
  planningPhaseId: string;
  planningWorkQuantity: string;
  constructionCostForecast: string;
  constructionPhaseId: string;
  constructionWorkQuantity: string;
  phaseId: string;
  phaseDetailId: string;
}

export type MyWorkloadDateFieldName =
  | 'planningStart'
  | 'planningEnd'
  | 'presenceStart'
  | 'presenceEnd'
  | 'visibilityStart'
  | 'visibilityEnd'
  | 'constructionStart'
  | 'constructionEnd';

export interface MyWorkloadTableProps {
  listOfProjects: MyWorkloadTableRow[];
  isLoading: boolean;
  hasError: boolean;
  viewType: MyWorkloadViewType;
}

export interface WidthFittedTableProps {
  enabled: boolean;
  children: ReactNode;
}

export interface PhaseInfo {
  id: string;
  label: string;
  value: string;
}

export interface MyWorkloadTableRow {
  id: string;
  budget: string;
  projectName: string;
  description: string;
  planningStart: string;
  planningEnd: string;
  presenceStart: string;
  presenceEnd: string;
  visibilityStart: string;
  visibilityEnd: string;
  constructionStart: string;
  constructionEnd: string;
  planningCostForecast: string;
  planningPhaseId: string;
  planningWorkQuantity: string;
  constructionCostForecast: string;
  constructionPhaseId: string;
  constructionWorkQuantity: string;
  phase: PhaseInfo;
  phaseDetail: PhaseInfo;
  functions: string;
  constructionProcurementMethod: string | undefined;
}

export interface MyWorkloadTaskItem {
  id: string;
  budget: string;
  totalCost: string;
  projectName: string;
  planningPeriod: string;
  constructionPeriod: string;
  constructionProcurementMethod: string;
  taskDescription: string;
  taskType: ProjectTaskType;
}

export type MyWorkloadViewType = 'planning' | 'construction';
