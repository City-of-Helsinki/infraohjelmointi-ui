import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';
import { BASIC_INFO_BRIEF_FIELDS, BASIC_INFO_FULL_FIELDS } from './BasicInfoSection';
import { DESIGN_CRITERIA_FIELDS } from './DesignCriteriaSection';
import { URBAN_SPACING_PLANNING_CRITERIA_FIELDS } from './UrbanSpacingPlanningCriteriaSection';
import { INTERACTION_AND_RELATED_PROJECTS_FIELDS } from './InteractionAndRelatedProjectsSection';
import { MAINTENANCE_NEEDS_FIELDS } from './MaintenanceNeedsSection';
import { TRAFFIC_PLANNING_CRITERIA_FIELDS } from './TrafficPlanningCriteriaSection';
import ReadonlyFieldList from '@/components/shared/ReadonlyFieldList';
import ProjectProgrammeLinksField from './ProjectProgrammeLinksField';

interface ProjectProgrammeReadonlySectionProps {
  sectionId: ProjectProgrammeSectionId;
  projectProgramme?: IProjectProgramme;
}

const fields: Record<Exclude<ProjectProgrammeSectionId, 'basicInfo'>, readonly string[]> = {
  designCriteria: DESIGN_CRITERIA_FIELDS.map((field) =>
    typeof field === 'string' ? field : field.field,
  ),
  trafficPlanningCriteria: TRAFFIC_PLANNING_CRITERIA_FIELDS,
  urbanSpacingPlanningCriteria: URBAN_SPACING_PLANNING_CRITERIA_FIELDS,
  maintenanceNeeds: MAINTENANCE_NEEDS_FIELDS,
  interactionAndRelatedProjects: INTERACTION_AND_RELATED_PROJECTS_FIELDS,
};

function getFieldsForSection(
  sectionId: ProjectProgrammeSectionId,
  projectProgramme?: IProjectProgramme,
) {
  switch (sectionId) {
    case 'basicInfo':
      return projectProgramme?.briefProjectProgramme ?? true
        ? BASIC_INFO_BRIEF_FIELDS
        : BASIC_INFO_FULL_FIELDS;
    default:
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
