import {
  Accordion,
  AccordionSize,
  Button,
  ButtonVariant,
  Notification,
  SupportedLanguage,
} from 'hds-react';
import { useTranslation } from 'react-i18next';
import { ProjectProgrammeSectionId } from './projectProgrammeSections';
import ProjectProgrammeReadonlySection from './ProjectProgrammeReadonlySection';
import useProjectProgrammeForm from '@/forms/useProjectProgrammeForm';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { FormProvider } from 'react-hook-form';

interface ProjectProgrammeSectionCardProps {
  sectionIsStarted: boolean;
  handleOpenSection(sectionId: ProjectProgrammeSectionId): void;
  label: string;
  cardText: string;
  actionText: string;
  sectionId: ProjectProgrammeSectionId;
  projectProgramme?: IProjectProgramme;
}

function ProjectProgrammeSectionCard({
  sectionIsStarted,
  handleOpenSection,
  label,
  actionText,
  cardText,
  sectionId,
  projectProgramme,
}: Readonly<ProjectProgrammeSectionCardProps>) {
  const { t, i18n } = useTranslation();
  const formMethods = useProjectProgrammeForm(projectProgramme);

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
          {Boolean(projectProgramme?.[sectionId]) && (
            <Accordion
              heading={t('content')}
              size={AccordionSize.Small}
              language={i18n.language as SupportedLanguage}
              headingLevel={3}
            >
              <FormProvider {...formMethods}>
                <div className="w-full">
                  <ProjectProgrammeReadonlySection
                    sectionId={sectionId}
                    projectProgramme={projectProgramme}
                  />
                </div>
              </FormProvider>
            </Accordion>
          )}
        </div>
      </Notification>
    </div>
  );
}

export default ProjectProgrammeSectionCard;
