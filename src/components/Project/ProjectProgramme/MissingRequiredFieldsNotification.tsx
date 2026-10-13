import { Link, Notification } from 'hds-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IProjectProgrammeSectionConfig,
  ProjectProgrammeSectionId,
} from './sections/projectProgrammeSections';

interface MissingRequiredFieldsNotificationProps {
  handleOpenSection(sectionId: ProjectProgrammeSectionId): void;
  PROJECT_PROGRAMME_SECTIONS: IProjectProgrammeSectionConfig[];
  missingRequiredSections: ProjectProgrammeSectionId[];
}

function MissingRequiredFieldsNotification({
  handleOpenSection,
  PROJECT_PROGRAMME_SECTIONS,
  missingRequiredSections,
}: Readonly<MissingRequiredFieldsNotificationProps>) {
  const { t } = useTranslation();

  const missingFieldsNotificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (missingRequiredSections.length > 0) {
      missingFieldsNotificationRef.current?.scrollIntoView?.({ block: 'center' });
      missingFieldsNotificationRef.current?.focus();
    }
  }, [missingRequiredSections]);

  return (
    <div ref={missingFieldsNotificationRef} tabIndex={-1}>
      <Notification
        type="error"
        label={t('projectProgrammeForm.missingRequiredFieldsTitle')}
        className="mt-6"
      >
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
