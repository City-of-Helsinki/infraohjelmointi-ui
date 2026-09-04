import { ProjectProgrammeSectionId } from '@/components/Project/ProjectProgramme/projectProgrammeSections';

export type ProjectProgrammeStatus = 'DRAFT' | 'COMPLETE';

export interface IProjectProgramme {
  id: string;
  status?: ProjectProgrammeStatus;
  briefProjectProgramme?: boolean;
  basicInfo?: IProjectProgrammeBasicInfo;
  designCriteria?: IProjectProgrammeDesignCriteria;
  trafficPlanningCriteria?: IProjectProgrammeTrafficPlanningCriteria;
  urbanSpacingPlanningCriteria?: IProjectProgrammeUrbanSpacingPlanningCriteria;
  maintenanceNeeds?: IProjectProgrammeMaintenanceNeeds;
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

export interface IProjectProgrammeTrafficPlanningCriteria {
  pedestrianTraffic?: string | null;
  bicycleTraffic?: string | null;
  serviceAndPickupTraffic?: string | null;
  otherTraffic?: string | null;
  accessibility?: string | null;
  noiseManagement?: string | null;
  winterMaintenance?: string | null;
  links?: IProjectProgrammeLinkFormItem[] | null;
}

export interface IProjectProgrammeUrbanSpacingPlanningCriteria {
  targetUrbanAppearance?: string | null;
  surfaceMaterials?: string | null;
  structures?: string | null;
  technicalNetworksAndSystems?: string | null;
  lighting?: string | null;
  greenery?: string | null;
  lumoConsiderationAndProtection?: string | null;
  natureTypes?: string | null;
  equipmentAndFurnishings?: string | null;
  waters?: string | null;
  stormwaterManagement?: string | null;
  links?: IProjectProgrammeLinkFormItem[] | null;
}

export interface IProjectProgrammeMaintenanceNeeds {
  maintenanceNeeds?: string | null;
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
  trafficPlanningCriteria?: IProjectProgrammeTrafficPlanningCriteria;
  urbanSpacingPlanningCriteria?: IProjectProgrammeUrbanSpacingPlanningCriteria;
  maintenanceNeeds?: IProjectProgrammeMaintenanceNeeds;
}

export interface IProjectProgrammeFormProps {
  projectProgrammeId: string;
  activeSection: ProjectProgrammeSectionId;
  effectiveProjectProgramme?: IProjectProgrammeForm;
  briefProgramme: boolean;
  onClose: () => void;
}
