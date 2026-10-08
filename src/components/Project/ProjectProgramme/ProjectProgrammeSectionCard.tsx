import {
  Accordion,
  AccordionSize,
  Button,
  ButtonVariant,
  IconCheckCircle,
  IconPen,
  Notification,
  StatusLabel,
  SupportedLanguage,
} from 'hds-react';
import { useTranslation } from 'react-i18next';
import ProjectProgrammeReadonlySection from './ProjectProgrammeReadonlySection';
import useProjectProgrammeForm from '@/forms/useProjectProgrammeForm';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';
import { FormProvider } from 'react-hook-form';
import { useAppDispatch } from '@/hooks/common';
import { useTransitionProjectProgrammeSectionStatusMutation } from '@/api/projectProgrammeApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  mapSectionIdToApiRoute,
  ProjectProgrammeSectionId,
} from './sections/projectProgrammeSections';
import useMarkProjectProgrammeSectionReady from './useMarkProjectProgrammeSectionReady';
import { hasAllRequiredFields } from './sections/projectProgrammeSectionFields';

interface ProjectProgrammeSectionCardProps {
  sectionIsStarted: boolean;
  handleOpenSection(sectionId: ProjectProgrammeSectionId): void;
  label: string;
  cardText: string;
  actionText: string;
  sectionId: ProjectProgrammeSectionId;
  projectProgramme?: IProjectProgramme;
  programmeIsComplete: boolean;
}

function ProjectProgrammeSectionCard({
  sectionIsStarted,
  handleOpenSection,
  label,
  actionText,
  cardText,
  sectionId,
  projectProgramme,
  programmeIsComplete,
}: Readonly<ProjectProgrammeSectionCardProps>) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const formMethods = useProjectProgrammeForm(projectProgramme);
  const [transitionSectionStatus] = useTransitionProjectProgrammeSectionStatusMutation();
  const markSectionReady = useMarkProjectProgrammeSectionReady(
    projectProgramme?.id,
    sectionId,
    programmeIsComplete,
  );
  const sectionStatus = projectProgramme?.[sectionId]?.status;
  const sectionIsComplete = sectionStatus === 'COMPLETE';
  const showSectionStatus = sectionIsStarted && (sectionStatus === 'DRAFT' || sectionIsComplete);

  async function returnSectionToDraft() {
    if (
      programmeIsComplete ||
      projectProgramme?.[sectionId]?.status !== 'COMPLETE' ||
      !projectProgramme?.id
    )
      return;

    try {
      await transitionSectionStatus({
        id: projectProgramme.id,
        section: mapSectionIdToApiRoute(sectionId),
        to: 'DRAFT',
      }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'projectProgrammeSectionReturnToDraftSuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeSectionReturnToDraftError',
          type: 'toast',
        }),
      );
    }
  }

  return (
    <div className="project-programme-section" key={sectionId}>
      <Notification
        type="info"
        label={
          <span className="flex w-full min-w-0 items-start gap-2">
            <span className="min-w-0 flex-1 break-words">{label}</span>
            {showSectionStatus && (
              <StatusLabel
                className="ml-auto shrink-0"
                type={sectionIsComplete ? 'success' : 'info'}
                iconStart={sectionIsComplete ? <IconCheckCircle /> : <IconPen />}
              >
                {t(
                  sectionIsComplete
                    ? 'projectProgrammeForm.sectionCompleteStatus'
                    : 'projectProgrammeForm.draftStatus',
                )}
              </StatusLabel>
            )}
          </span>
        }
      >
        <div className="project-programme-notification-content">
          <p>{cardText}</p>
          <div className="flex flex-wrap gap-4">
            {!programmeIsComplete && !sectionIsComplete && (
              <>
                {sectionIsStarted && hasAllRequiredFields(sectionId, projectProgramme) && (
                  <Button
                    variant={ButtonVariant.Primary}
                    type="button"
                    onClick={() => markSectionReady()}
                  >
                    {t('projectProgrammeForm.markSectionReady')}
                  </Button>
                )}
                <Button
                  variant={sectionIsStarted ? ButtonVariant.Secondary : ButtonVariant.Primary}
                  type="button"
                  style={sectionIsStarted ? { backgroundColor: 'var(--color-white)' } : undefined}
                  onClick={() => handleOpenSection(sectionId)}
                >
                  {sectionIsStarted ? t('projectProgrammeForm.modifyInformation') : actionText}
                </Button>
              </>
            )}
            {!programmeIsComplete && sectionIsComplete && (
              <Button
                variant={ButtonVariant.Secondary}
                style={{ backgroundColor: 'var(--color-white)' }}
                type="button"
                onClick={returnSectionToDraft}
              >
                {t('projectProgrammeForm.returnSectionToDraft')}
              </Button>
            )}
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
