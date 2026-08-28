import { Button, ButtonVariant, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';

interface ProjectProgrammeSectionCardProps {
  briefProgramme: boolean;
  sectionIsStarted: boolean;
  handleOpenSection(sectionId: ProjectProgrammeSectionId): Promise<void>;
  label: string;
  cardText: string;
  actionText: string;
  sectionId: ProjectProgrammeSectionId;
}

function ProjectProgrammeSectionCard({
  sectionIsStarted,
  handleOpenSection,
  label,
  actionText,
  cardText,
  sectionId,
}: Readonly<ProjectProgrammeSectionCardProps>) {
  const { t } = useTranslation();

  return (
    <div className="project-programme-section" key={sectionId}>
      <Notification type="info" label={label}>
        <div className="project-programme-notification-content">
          <p>{cardText}</p>
          <div>
            <Button
              variant={sectionIsStarted ? ButtonVariant.Secondary : ButtonVariant.Primary}
              type="button"
              onClick={() => handleOpenSection(sectionId)}
            >
              {sectionIsStarted ? t('projectProgrammeForm.modifyInformation') : actionText}
            </Button>
          </div>
        </div>
      </Notification>
    </div>
  );
}

export default ProjectProgrammeSectionCard;
