export type ProjectProgrammeStatus = 'DRAFT' | 'COMPLETE';

export interface IProjectProgramme {
  id: string;
  status?: ProjectProgrammeStatus;
  briefProjectProgramme?: boolean;
  basicInfo?: IProjectProgrammeBasicInfo | null;
}

export interface IProjectProgrammeTransitionResponse {
  currentStatus: ProjectProgrammeStatus;
}

export interface IProjectProgrammeBasicInfo {
  projectName?: string | null;
  district?: string | { name?: string | null } | null;
  projectProgrammeCompiler?: string | null;
  personsInvolved?: string | null;
  inspector?: string | null;
  summary?: string | null;
  strategyGoals?: string | null;
  costClass?: string | null;
  projectSize?: string | null;
  risks?: string | null;
  studyAndPlanningNeeds?: string | null;
  planningAndImplementationFeasibility?: string | null;
  specialConsiderations?: string | null;
  otherConsiderations?: string | null;
  links?: Array<string | { value?: string | null }> | null;
}
