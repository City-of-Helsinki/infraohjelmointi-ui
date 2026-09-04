import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const MAINTENANCE_NEEDS_FIELDS = ['maintenanceNeeds'] as const;

function MaintenanceNeedsSection() {
  return (
    <ProjectProgrammeTextAreaFieldsSection
      section="maintenanceNeeds"
      titleName="projectProgrammeMaintenanceNeeds"
      titleLabel="projectProgrammeForm.maintenanceNeedsSectionTitle"
      testId="project-programme-maintenance-needs-form"
      fields={MAINTENANCE_NEEDS_FIELDS}
    />
  );
}

export default memo(MaintenanceNeedsSection);
