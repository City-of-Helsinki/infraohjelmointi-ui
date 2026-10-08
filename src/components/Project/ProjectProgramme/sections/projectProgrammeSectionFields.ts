import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { getRequiredFieldNames } from '@/utils/projectProgrammeUtils';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';
import { BASIC_INFO_BRIEF_FIELDS, BASIC_INFO_FULL_FIELDS } from './BasicInfoSection';
import { DESIGN_CRITERIA_FIELDS } from './DesignCriteriaSection';
import { URBAN_SPACING_PLANNING_CRITERIA_FIELDS } from './UrbanSpacingPlanningCriteriaSection';
import { INTERACTION_AND_RELATED_PROJECTS_FIELDS } from './InteractionAndRelatedProjectsSection';
import { MAINTENANCE_NEEDS_FIELDS } from './MaintenanceNeedsSection';
import { TRAFFIC_PLANNING_CRITERIA_FIELDS } from './TrafficPlanningCriteriaSection';

type SectionField = { field: string; required?: boolean };

const SECTION_FIELDS: Record<
  Exclude<ProjectProgrammeSectionId, 'basicInfo'>,
  readonly SectionField[]
> = {
  designCriteria: DESIGN_CRITERIA_FIELDS,
  trafficPlanningCriteria: TRAFFIC_PLANNING_CRITERIA_FIELDS,
  urbanSpacingPlanningCriteria: URBAN_SPACING_PLANNING_CRITERIA_FIELDS,
  maintenanceNeeds: MAINTENANCE_NEEDS_FIELDS,
  interactionAndRelatedProjects: INTERACTION_AND_RELATED_PROJECTS_FIELDS,
};

function isBrief(projectProgramme?: Pick<IProjectProgramme, 'briefProjectProgramme'>) {
  return projectProgramme?.briefProjectProgramme ?? true;
}

function getSectionFields(
  sectionId: ProjectProgrammeSectionId,
  projectProgramme?: Pick<IProjectProgramme, 'briefProjectProgramme'>,
): readonly SectionField[] {
  if (sectionId === 'basicInfo') {
    return isBrief(projectProgramme) ? BASIC_INFO_BRIEF_FIELDS : BASIC_INFO_FULL_FIELDS;
  }
  return SECTION_FIELDS[sectionId] ?? [];
}

function hasText(value: unknown): boolean {
  const text =
    typeof value === 'object' && value !== null ? (value as { name?: unknown }).name : value;
  return typeof text === 'string' && text.trim() !== '';
}

export function hasAllRequiredFields(
  sectionId: ProjectProgrammeSectionId,
  projectProgramme?: IProjectProgramme,
): boolean {
  const sectionValues = projectProgramme?.[sectionId] as Record<string, unknown> | undefined;
  if (!sectionValues) return false;

  return getRequiredFieldNames(getSectionFields(sectionId, projectProgramme)).every((field) =>
    hasText(sectionValues[field]),
  );
}

export function getFieldsForSection(
  sectionId: ProjectProgrammeSectionId,
  projectProgramme?: Pick<IProjectProgramme, 'briefProjectProgramme'>,
): readonly string[] {
  return getSectionFields(sectionId, projectProgramme).map((field) => field.field);
}
