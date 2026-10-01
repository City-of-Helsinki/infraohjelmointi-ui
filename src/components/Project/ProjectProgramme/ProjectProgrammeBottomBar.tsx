import { Button, ButtonVariant } from 'hds-react';
import { useTranslation } from 'react-i18next';
import ProjectProgrammeActionButtons from './ProjectProgrammeActionButtons';
import ProjectProgrammeStatusTransitionButtons from './ProjectProgrammeStatusTransitionButtons';

interface ProjectProgrammeBottomBarProps {
  isBriefProgramme: boolean;
  hasSavedExtendedSection: boolean;
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
  handleSwitchType: () => Promise<unknown>;
}

function ProjectProgrammeBottomBar({
  isBriefProgramme,
  hasSavedExtendedSection,
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
  handleSwitchType,
}: Readonly<ProjectProgrammeBottomBarProps>) {
  const { t } = useTranslation();

  return (
    <div className="project-form-banner">
      <div className="project-form-banner-container">
        <div className="project-programme-actions">
          <ProjectProgrammeStatusTransitionButtons
            isProjectProgrammeComplete={isProjectProgrammeComplete}
            effectiveProjectProgrammeId={effectiveProjectProgrammeId}
          />
          <ProjectProgrammeActionButtons />
          {!isBriefProgramme && !hasSavedExtendedSection && (
            <Button variant={ButtonVariant.Secondary} type="button" onClick={handleSwitchType}>
              {t('projectProgrammeForm.switchToBriefProgramme')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectProgrammeBottomBar;
