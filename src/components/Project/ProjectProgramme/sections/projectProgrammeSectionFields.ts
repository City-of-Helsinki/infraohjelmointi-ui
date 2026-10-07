import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';
import { BASIC_INFO_BRIEF_FIELDS, BASIC_INFO_FULL_FIELDS } from './BasicInfoSection';
import { DESIGN_CRITERIA_FIELDS } from './DesignCriteriaSection';
import { URBAN_SPACING_PLANNING_CRITERIA_FIELDS } from './UrbanSpacingPlanningCriteriaSection';
import { INTERACTION_AND_RELATED_PROJECTS_FIELDS } from './InteractionAndRelatedProjectsSection';
import { MAINTENANCE_NEEDS_FIELDS } from './MaintenanceNeedsSection';
import { TRAFFIC_PLANNING_CRITERIA_FIELDS } from './TrafficPlanningCriteriaSection';

function mapToFieldNames(fields: readonly { field: string }[]) {
  return fields.map((field) => field.field);
}

const SECTION_FIELDS: Record<Exclude<ProjectProgrammeSectionId, 'basicInfo'>, readonly string[]> = {
  designCriteria: mapToFieldNames(DESIGN_CRITERIA_FIELDS),
  trafficPlanningCriteria: mapToFieldNames(TRAFFIC_PLANNING_CRITERIA_FIELDS),
  urbanSpacingPlanningCriteria: mapToFieldNames(URBAN_SPACING_PLANNING_CRITERIA_FIELDS),
  maintenanceNeeds: mapToFieldNames(MAINTENANCE_NEEDS_FIELDS),
  interactionAndRelatedProjects: mapToFieldNames(INTERACTION_AND_RELATED_PROJECTS_FIELDS),
  otherAttachments: [],
};

export function getFieldsForSection(
  sectionId: ProjectProgrammeSectionId,
  projectProgramme?: Pick<IProjectProgramme, 'briefProjectProgramme'>,
): readonly string[] {
  if (sectionId === 'basicInfo') {
    return (projectProgramme?.briefProjectProgramme ?? true)
      ? BASIC_INFO_BRIEF_FIELDS
      : BASIC_INFO_FULL_FIELDS;
  }
  return SECTION_FIELDS[sectionId] ?? [];
}
