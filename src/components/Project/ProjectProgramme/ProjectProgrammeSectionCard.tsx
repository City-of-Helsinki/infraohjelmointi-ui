import { Button, ButtonVariant, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { ProjectProgrammeSectionId } from './sections/projectProgrammeSections';

interface ProjectProgrammeSectionCardProps {
  sectionIsStarted: boolean;
  handleOpenSection(sectionId: ProjectProgrammeSectionId): void;
  label: string;
  cardText: string;
  actionText: string;
  sectionId: ProjectProgrammeSectionId;
  programmeIsComplete: boolean;
}

function ProjectProgrammeSectionCard({
  sectionIsStarted,
  handleOpenSection,
  label,
  actionText,
  cardText,
  sectionId,
  programmeIsComplete,
}: Readonly<ProjectProgrammeSectionCardProps>) {
  const { t } = useTranslation();

  return (
    <div className="project-programme-section" key={sectionId}>
      <Notification type="info" label={label}>
        <div className="project-programme-notification-content">
          <p>{cardText}</p>
          <div>
            {!programmeIsComplete && (
              <Button
                variant={sectionIsStarted ? ButtonVariant.Secondary : ButtonVariant.Primary}
                type="button"
                onClick={() => handleOpenSection(sectionId)}
              >
                {sectionIsStarted ? t('projectProgrammeForm.modifyInformation') : actionText}
              </Button>
            )}
          </div>
        </div>
      </Notification>
    </div>
  );
}

export default ProjectProgrammeSectionCard;
