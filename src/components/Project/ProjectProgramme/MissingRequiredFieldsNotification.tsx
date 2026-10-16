import { Link, Notification } from 'hds-react';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IProjectProgrammeSectionConfig,
  ProjectProgrammeSectionId,
} from './sections/projectProgrammeSections';

interface MissingRequiredFieldsNotificationProps {
  missingFieldsNotificationRef: RefObject<HTMLDivElement>;
  handleOpenSection(sectionId: ProjectProgrammeSectionId): void;
  PROJECT_PROGRAMME_SECTIONS: IProjectProgrammeSectionConfig[];
  missingRequiredSections: ProjectProgrammeSectionId[];
}

function MissingRequiredFieldsNotification({
  missingFieldsNotificationRef,
  handleOpenSection,
  PROJECT_PROGRAMME_SECTIONS,
  missingRequiredSections,
}: Readonly<MissingRequiredFieldsNotificationProps>) {
  const { t } = useTranslation();

  return (
    <div ref={missingFieldsNotificationRef} tabIndex={-1}>
      <Notification type="error" label={t('projectProgrammeForm.missingRequiredFieldsTitle')}>
        <p>{t('projectProgrammeForm.missingRequiredFieldsText')}</p>
        <ul>
          {PROJECT_PROGRAMME_SECTIONS.filter((section) =>
            missingRequiredSections.includes(section.id),
          ).map((section) => (
            <li key={section.id} className="mb-2">
              <Link
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleOpenSection(section.id);
                }}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </Notification>
    </div>
  );
}

export default MissingRequiredFieldsNotification;
