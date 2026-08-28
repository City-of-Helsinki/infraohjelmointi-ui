export type ProjectProgrammeStatus = 'DRAFT' | 'COMPLETE';

export interface IProjectProgramme {
  id: string;
  status?: ProjectProgrammeStatus;
  briefProjectProgramme?: boolean;
  basicInfo?: IProjectProgrammeBasicInfo | null;
  designCriteria?: IProjectProgrammeDesignCriteria | null;
}

export interface IProjectProgrammeTransitionResponse {
  currentStatus: ProjectProgrammeStatus;
}

export interface IProjectProgrammeBasicInfo {
  projectName?: string | null;
  district?: string | { name?: string | null } | null;
  projectProgrammeCompiler?: string | null;
  personsInvolved?: string | null;
  estimatedCosts?: string | null;
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

export interface IProjectProgrammeDesignCriteria {
  guidingZoningRegulations?: string | null;
  siteValuesProtectionAndSignificance?: string | null;
  relationshipToPublicAreaServices?: string | null;
}

export interface IProjectProgrammeLinkFormItem {
  value: string;
}

export interface IProjectProgrammeBasicInfoForm {
  projectName: string;
  district: string;
  projectProgrammeCompiler: string;
  personsInvolved: string;
  estimatedCosts: string;
  inspector: string;
  summary: string;
  strategyGoals: string;
  costClass: string;
  projectSize: string;
  risks: string;
  studyAndPlanningNeeds: string;
  planningAndImplementationFeasibility: string;
  specialConsiderations: string;
  otherConsiderations: string;
  links: IProjectProgrammeLinkFormItem[];
}

export interface IProjectProgrammeForm {
  basicInfo: IProjectProgrammeBasicInfoForm;
  designCriteria: IProjectProgrammeDesignCriteria;
  links: IProjectProgrammeLinkFormItem[];
}
