import { ButtonPresetTheme, ButtonVariant, Link, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import {
  IProjectProgrammeSectionConfig,
  ProjectProgrammeRequiredSectionId,
  ProjectProgrammeSectionId,
} from './sections/projectProgrammeSections';
import ProjectProgrammeActionButtons from './ProjectProgrammeActionButtons';
import ProjectProgrammeStatusTransitionButtons from './ProjectProgrammeStatusTransitionButtons';
import { IProjectProgramme } from '@/interfaces/projectProgrammeInterfaces';

type Section = Pick<IProjectProgrammeSectionConfig, 'id' | 'label'>;

interface ProjectProgrammeDraftStateNotificationProps {
  sectionsInCompletedState: Section[];
  sectionsInDraftState: Section[];
  onOpenSection: (sectionId: ProjectProgrammeSectionId) => void;
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
  effectiveProjectProgramme?: IProjectProgramme;
  onMissingRequiredFields?: (sections: ProjectProgrammeRequiredSectionId[]) => void;
}

interface ProjectProgrammeSectionListProps {
  sections: Section[];
  labelKey:
    'projectProgrammeForm.completedStateSections' | 'projectProgrammeForm.draftStateSections';
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
  effectiveProjectProgramme,
  onMissingRequiredFields,
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
        <ProjectProgrammeStatusTransitionButtons
          isProjectProgrammeComplete={isProjectProgrammeComplete}
          effectiveProjectProgrammeId={effectiveProjectProgrammeId}
          effectiveProjectProgramme={effectiveProjectProgramme}
          onMissingRequiredFields={onMissingRequiredFields}
          buttonOverrides={{
            markReady: {
              variant: ButtonVariant.Secondary,
              theme: ButtonPresetTheme.Black,
              style: { backgroundColor: 'var(--color-white)' },
            },
          }}
        />
        <ProjectProgrammeActionButtons
          buttonOverrides={{
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
