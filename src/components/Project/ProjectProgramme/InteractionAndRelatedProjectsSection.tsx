import { memo } from 'react';
import ProjectProgrammeTextAreaFieldsSection from './ProjectProgrammeTextAreaFieldsSection';

const INTERACTION_AND_RELATED_PROJECTS_FIELDS = [
  'collaborationAndExperts',
  'interactionNotes',
] as const;

function InteractionAndRelatedProjectsSection() {
  return (
    <ProjectProgrammeTextAreaFieldsSection
      section="interactionAndRelatedProjects"
      titleName="projectProgrammeInteractionAndRelatedProjects"
      titleLabel="projectProgrammeForm.interactionAndRelatedProjectsSectionTitle"
      testId="project-programme-interaction-and-related-projects-form"
      fields={INTERACTION_AND_RELATED_PROJECTS_FIELDS}
    />
  );
}

export default memo(InteractionAndRelatedProjectsSection);
