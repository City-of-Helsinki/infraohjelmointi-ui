import { ProjectProgrammeSectionId } from '@/components/Project/ProjectProgramme/sections/projectProgrammeSections';
import { IProject } from './projectInterfaces';
import { Button, ButtonVariant } from 'hds-react';
import { ComponentProps } from 'react';

export type ProjectProgrammeStatus = 'DRAFT' | 'COMPLETE';

export interface IProjectProgramme {
  id: string;
  status?: ProjectProgrammeStatus;
  briefProjectProgramme?: boolean;
  locationMap?: IProjectProgrammeLocationMap | null;
  basicInfo?: IProjectProgrammeBasicInfo;
  designCriteria?: IProjectProgrammeDesignCriteria;
  trafficPlanningCriteria?: IProjectProgrammeTrafficPlanningCriteria;
  urbanSpacingPlanningCriteria?: IProjectProgrammeUrbanSpacingPlanningCriteria;
  maintenanceNeeds?: IProjectProgrammeMaintenanceNeeds;
  interactionAndRelatedProjects?: IProjectProgrammeInteractionAndRelatedProjects;
}

export interface IProjectProgrammeLocationMap {
  id?: string;
  url?: string | null;
  downloadUrl?: string | null;
  fileName?: string | null;
  status?: ProjectProgrammeStatus;
}

export interface IProjectProgrammeTransitionResponse {
  currentStatus: ProjectProgrammeStatus;
}

export interface IProjectProgrammeSectionTransitionResponse extends IProjectProgrammeTransitionResponse {
  section: string;
}

interface IProjectProgrammeSectionShared {
  links?: IProjectProgrammeLinkFormItem[] | null;
  status?: ProjectProgrammeStatus;
}

export interface IProjectProgrammeBasicInfo extends IProjectProgrammeSectionShared {
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
}

export interface IProjectProgrammeDesignCriteria extends IProjectProgrammeSectionShared {
  guidingZoningRegulations?: string | null;
  siteValuesProtectionAndSignificance?: string | null;
  relationshipToPublicAreaServices?: string | null;
}

export interface IProjectProgrammeTrafficPlanningCriteria extends IProjectProgrammeSectionShared {
  targetTrafficChanges?: string | null;
  pedestrianTraffic?: string | null;
  bicycleTraffic?: string | null;
  carTraffic?: string | null;
  serviceAndPickupTraffic?: string | null;
  otherTraffic?: string | null;
  accessibility?: string | null;
  noiseManagement?: string | null;
  winterMaintenance?: string | null;
}

export interface IProjectProgrammeUrbanSpacingPlanningCriteria extends IProjectProgrammeSectionShared {
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
}

export interface IProjectProgrammeMaintenanceNeeds extends IProjectProgrammeSectionShared {
  maintenanceNeeds?: string | null;
}

export interface IProjectProgrammeInteractionAndRelatedProjects extends IProjectProgrammeSectionShared {
  collaborationAndExperts?: string | null;
  interactionNotes?: string | null;
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
  interactionAndRelatedProjects?: IProjectProgrammeInteractionAndRelatedProjects;
}

export interface IProjectProgrammeFormProps {
  projectProgrammeId: string;
  activeSection: ProjectProgrammeSectionId;
  effectiveProjectProgramme?: IProjectProgrammeForm;
  briefProgramme: boolean;
  isProjectProgrammeComplete: boolean;
  onClose: () => void;
  project?: IProject;
}

type ActionButtonVariant = Exclude<ButtonVariant, ButtonVariant.Supplementary>;

type ActionButtonVisualProps = Pick<ComponentProps<typeof Button>, 'theme' | 'style'> & {
  variant?: ActionButtonVariant;
};

export interface ProjectProgrammeActionButtonsOverrides {
  copyLink?: ActionButtonVisualProps;
  makePdf?: ActionButtonVisualProps;
}

export interface ProjectProgrammeStatusTransitionButtonsOverrides {
  markReady?: ActionButtonVisualProps;
  markDraft?: ActionButtonVisualProps;
}

export interface ProjectProgrammeStatusTransitionButtonsProps {
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
  buttonOverrides?: ProjectProgrammeStatusTransitionButtonsOverrides;
}

export interface ProjectProgrammeActionButtonsProps {
  buttonOverrides?: ProjectProgrammeActionButtonsOverrides;
}

export interface IProjectProgrammePdfSection {
  id: ProjectProgrammeSectionId;
  label: string;
}

export interface IProjectProgrammePdfDocumentProps {
  projectProgramme: IProjectProgramme;
  sections: IProjectProgrammePdfSection[];
  projectName: string;
  createdDate: string;
}
