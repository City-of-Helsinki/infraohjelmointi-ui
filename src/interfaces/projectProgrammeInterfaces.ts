import { ProjectProgrammeSectionId } from '@/components/Project/ProjectProgramme/projectProgrammeSections';

export type ProjectProgrammeStatus = 'DRAFT' | 'COMPLETE';

export interface IProjectProgramme {
  id: string;
  status?: ProjectProgrammeStatus;
  briefProjectProgramme?: boolean;
  basicInfo?: IProjectProgrammeBasicInfo;
  designCriteria?: IProjectProgrammeDesignCriteria;
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
  links?: IProjectProgrammeLinkFormItem[] | null;
}

export interface IProjectProgrammeDesignCriteria {
  guidingZoningRegulations?: string | null;
  siteValuesProtectionAndSignificance?: string | null;
  relationshipToPublicAreaServices?: string | null;
  links?: IProjectProgrammeLinkFormItem[] | null;
}

export interface IProjectProgrammeLinkFormItem {
  id?: string;
  contentType?: number;
  objectId?: string;
  value: string;
}

export interface IProjectProgrammeForm {
  basicInfo?: IProjectProgrammeBasicInfo;
  designCriteria?: IProjectProgrammeDesignCriteria;
}

export interface IProjectProgrammeFormProps {
  projectProgrammeId: string;
  activeSection: ProjectProgrammeSectionId;
  effectiveProjectProgramme?: IProjectProgrammeForm;
  briefProgramme: boolean;
  onClose: () => void;
}
