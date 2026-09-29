import { ButtonPresetTheme, ButtonVariant, Link, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import {
  IProjectProgrammeSectionConfig,
  ProjectProgrammeSectionId,
} from './projectProgrammeSections';
import ProjectProgrammeActionButtons from './ProjectProgrammeActionButtons';

type Section = Pick<IProjectProgrammeSectionConfig, 'id' | 'label'>;

interface ProjectProgrammeDraftStateNotificationProps {
  sectionsInCompletedState: Section[];
  sectionsInDraftState: Section[];
  onOpenSection: (sectionId: ProjectProgrammeSectionId) => void;
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
}

interface ProjectProgrammeSectionListProps {
  sections: Section[];
  labelKey:
    | 'projectProgrammeForm.completedStateSections'
    | 'projectProgrammeForm.draftStateSections';
  containerClassName: string;
  onOpenSection: (sectionId: ProjectProgrammeSectionId) => void;
}

function ProjectProgrammeSectionList({
  sections,
  labelKey,
  containerClassName,
  onOpenSection,
}: Readonly<ProjectProgrammeSectionListProps>) {
  const { t } = useTranslation();

  if (sections.length === 0) return null;

  return (
    <div className={containerClassName}>
      <p className="text-body">{t(labelKey)}</p>
      <ul>
        {sections.map((section) => (
          <li key={section.id} className="mb-2">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenSection(section.id);
              }}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectProgrammeDraftStateNotification({
  sectionsInCompletedState = [],
  sectionsInDraftState = [],
  onOpenSection,
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
}: Readonly<ProjectProgrammeDraftStateNotificationProps>) {
  const { t } = useTranslation();

  return (
    <Notification type="info" label={t('projectProgrammeForm.draftStateLabel')} className="mt-6">
      <ProjectProgrammeSectionList
        sections={sectionsInCompletedState}
        labelKey="projectProgrammeForm.completedStateSections"
        containerClassName="mb-4"
        onOpenSection={onOpenSection}
      />
      <ProjectProgrammeSectionList
        sections={sectionsInDraftState}
        labelKey="projectProgrammeForm.draftStateSections"
        containerClassName="mb-8"
        onOpenSection={onOpenSection}
      />

      <div className="flex flex-wrap gap-4">
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
