import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const DESIGN_CRITERIA_FIELDS = [
  'guidingZoningRegulations',
  'relationshipToPublicAreaServices',
  'siteValuesProtectionAndSignificance',
] as const;

function DesignCriteriaSection() {
  return (
    <ProjectProgrammeTextAreaFieldsSection
      section="designCriteria"
      titleName="projectProgrammeDesignCriteria"
      titleLabel="projectProgrammeForm.designCriteriaSectionTitle"
      testId="project-programme-design-criteria-form"
      fields={DESIGN_CRITERIA_FIELDS}
    />
  );
}

export default memo(DesignCriteriaSection);
