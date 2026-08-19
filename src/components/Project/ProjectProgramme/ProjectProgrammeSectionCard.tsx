import { Button, ButtonVariant, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { PROJECT_PROGRAMME_SECTIONS } from './projectProgrammeSections';

interface ProjectProgrammeSectionCardProps {
  extendedSectionTextSuffix: string;
  briefProgramme: boolean;
  sectionIsStarted: boolean;
  isProjectProgrammeComplete: boolean;
  handleOpenSection(sectionId: 'basicInfo'): Promise<void>;
}

function ProjectProgrammeSectionCard({
  extendedSectionTextSuffix,
  briefProgramme,
  sectionIsStarted,
  handleOpenSection,
}: Readonly<ProjectProgrammeSectionCardProps>) {
  const { t } = useTranslation();
  return (
    <>
      {PROJECT_PROGRAMME_SECTIONS.filter((section) => !briefProgramme || section.showInBrief).map(
        (section) => {
          let sectionDescription = t(section.textKey);
          if (!briefProgramme) {
            sectionDescription = `${sectionDescription} ${extendedSectionTextSuffix}`;
          }

          return (
            <div className="project-programme-section" key={section.id}>
              <Notification type="info" label={t(section.labelKey)}>
                <div className="project-programme-notification-content">
                  <p>{sectionDescription}</p>
                  <div>
                    <Button
                      variant={sectionIsStarted ? ButtonVariant.Secondary : ButtonVariant.Primary}
                      type="button"
                      onClick={() => handleOpenSection(section.id)}
                    >
                      {sectionIsStarted
                        ? t('projectProgrammeForm.modifyInformation')
                        : t(section.actionKey)}
                    </Button>
                  </div>
                </div>
              </Notification>
            </div>
          );
        },
      )}
    </>
  );
}

export default ProjectProgrammeSectionCard;
