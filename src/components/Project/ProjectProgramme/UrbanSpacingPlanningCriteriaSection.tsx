import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const URBAN_SPACING_PLANNING_CRITERIA_FIELDS = [
  'targetUrbanAppearance',
  'surfaceMaterials',
  'structures',
  'technicalNetworksAndSystems',
  'lighting',
  'greenery',
  'lumoConsiderationAndProtection',
  'natureTypes',
  'equipmentAndFurnishings',
  'waters',
  'stormwaterManagement',
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
