import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from './sections/projectProgrammeSections';
import { BASIC_INFO_BRIEF_FIELDS, BASIC_INFO_FULL_FIELDS } from './sections/BasicInfoSection';
import { DESIGN_CRITERIA_FIELDS } from './sections/DesignCriteriaSection';
import { URBAN_SPACING_PLANNING_CRITERIA_FIELDS } from './sections/UrbanSpacingPlanningCriteriaSection';
import { INTERACTION_AND_RELATED_PROJECTS_FIELDS } from './sections/InteractionAndRelatedProjectsSection';
import { MAINTENANCE_NEEDS_FIELDS } from './sections/MaintenanceNeedsSection';
import { TRAFFIC_PLANNING_CRITERIA_FIELDS } from './sections/TrafficPlanningCriteriaSection';
import ReadonlyFieldList from '@/components/shared/ReadonlyFieldList';
import ProjectProgrammeLinksField from './ProjectProgrammeLinksField';

interface ProjectProgrammeReadonlySectionProps {
  sectionId: ProjectProgrammeSectionId;
  projectProgramme?: IProjectProgramme;
}

function mapToFieldNames(fields: readonly { field: string }[]) {
  return fields.map((field) => field.field);
}

const fields: Record<Exclude<ProjectProgrammeSectionId, 'basicInfo'>, readonly string[]> = {
  designCriteria: mapToFieldNames(DESIGN_CRITERIA_FIELDS),
  trafficPlanningCriteria: mapToFieldNames(TRAFFIC_PLANNING_CRITERIA_FIELDS),
  urbanSpacingPlanningCriteria: mapToFieldNames(URBAN_SPACING_PLANNING_CRITERIA_FIELDS),
  maintenanceNeeds: mapToFieldNames(MAINTENANCE_NEEDS_FIELDS),
  interactionAndRelatedProjects: mapToFieldNames(INTERACTION_AND_RELATED_PROJECTS_FIELDS),
};

function getFieldsForSection(
  sectionId: ProjectProgrammeSectionId,
  projectProgramme?: IProjectProgramme,
) {
  if (sectionId === 'basicInfo') {
    return (projectProgramme?.briefProjectProgramme ?? true)
      ? BASIC_INFO_BRIEF_FIELDS
      : BASIC_INFO_FULL_FIELDS;
  } else {
    return fields[sectionId] ?? [];
  }
}

export default function ProjectProgrammeReadonlySection({
  sectionId,
  projectProgramme,
}: Readonly<ProjectProgrammeReadonlySectionProps>) {
  return (
    <>
      <ReadonlyFieldList
        fields={getFieldsForSection(sectionId, projectProgramme)}
        pathPrefix={sectionId}
        translationNamespace="projectProgrammeForm"
      />
      <ProjectProgrammeLinksField section={sectionId} mode="view" />
    </>
  );
}
