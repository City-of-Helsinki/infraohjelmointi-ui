import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const DESIGN_CRITERIA_FIELDS = [
  { field: 'guidingZoningRegulations', required: false },
  { field: 'relationshipToPublicAreaServices' },
  { field: 'siteValuesProtectionAndSignificance' },
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
