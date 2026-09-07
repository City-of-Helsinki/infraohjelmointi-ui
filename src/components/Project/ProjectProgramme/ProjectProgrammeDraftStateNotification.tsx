import { ButtonPresetTheme, ButtonVariant, Link, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import {
  IProjectProgrammeSectionConfig,
  ProjectProgrammeSectionId,
} from './projectProgrammeSections';
import ProjectProgrammeActionButtons from './ProjectProgrammeActionButtons';

interface ProjectProgrammeDraftStateNotificationProps {
  sectionsInDraftState: Pick<IProjectProgrammeSectionConfig, 'id' | 'label'>[];
  onOpenSection: (sectionId: ProjectProgrammeSectionId) => void;
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
}

function ProjectProgrammeDraftStateNotification({
  sectionsInDraftState,
  onOpenSection,
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
}: Readonly<ProjectProgrammeDraftStateNotificationProps>) {
  const { t } = useTranslation();

  function handleLinkClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    sectionId: ProjectProgrammeSectionId,
  ) {
    e.preventDefault();
    onOpenSection(sectionId);
  }

  return (
    <Notification type="info" label={t('projectProgrammeForm.draftStateLabel')} className="mt-6">
      {sectionsInDraftState.length > 0 && (
        <p className="text-body">{t('projectProgrammeForm.draftStateSections')}</p>
      )}
      <ul>
        {sectionsInDraftState.map((section) => (
          <li key={section.id} className="mb-2">
            <Link
              href="#"
              onClick={(e) => {
                handleLinkClick(e, section.id);
              }}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-4">
        <ProjectProgrammeActionButtons
          isProjectProgrammeComplete={isProjectProgrammeComplete}
          effectiveProjectProgrammeId={effectiveProjectProgrammeId}
          buttonOverrides={{
            markReady: {
              variant: ButtonVariant.Secondary,
              theme: ButtonPresetTheme.Black,
              style: { backgroundColor: 'var(--color-white)' },
            },
            copyLink: {
              theme: ButtonPresetTheme.Black,
              style: { backgroundColor: 'var(--color-white)' },
            },
            makePdf: {
              theme: ButtonPresetTheme.Black,
              style: { backgroundColor: 'var(--color-white)' },
            },
          }}
        />
      </div>
    </Notification>
  );
}

export default ProjectProgrammeDraftStateNotification;
