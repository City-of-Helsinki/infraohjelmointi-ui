import { ButtonPresetTheme, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';
import ProjectProgrammeActionButtons from './ProjectProgrammeActionButtons';

function ProgrammeCompletedNotification(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="project-form mx-auto max-w-xl">
      <Notification
        type="success"
        label={t('projectProgrammeForm.programmeCompletedNotificationTitle')}
      >
        <div className="project-programme-notification-content">
          <p>{t('projectProgrammeForm.programmeCompletedNotificationText')}</p>
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
    </div>
  );
}

export default ProgrammeCompletedNotification;
