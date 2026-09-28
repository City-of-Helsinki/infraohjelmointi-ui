import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const URBAN_SPACING_PLANNING_CRITERIA_FIELDS = [
  { field: 'targetUrbanAppearance' },
  { field: 'surfaceMaterials' },
  { field: 'structures' },
  { field: 'technicalNetworksAndSystems' },
  { field: 'lighting' },
  { field: 'greenery' },
  { field: 'lumoConsiderationAndProtection' },
  { field: 'natureTypes' },
  { field: 'equipmentAndFurnishings' },
  { field: 'waters' },
  { field: 'stormwaterManagement' },
] as const;

function UrbanSpacingPlanningCriteriaSection() {
  return (
    <ProjectProgrammeTextAreaFieldsSection
      section="urbanSpacingPlanningCriteria"
      titleName="projectProgrammeUrbanSpacingPlanningCriteria"
      titleLabel="projectProgrammeForm.urbanSpacingPlanningCriteriaSectionTitle"
      testId="project-programme-urban-spacing-planning-criteria-form"
      fields={URBAN_SPACING_PLANNING_CRITERIA_FIELDS}
    />
  );
}

export default memo(UrbanSpacingPlanningCriteriaSection);
