import { Button, ButtonVariant, Notification } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface SwitchToExtendedProgrammeNotificationProps {
  handleSwitchType: () => Promise<unknown>;
}

function SwitchToExtendedProgrammeNotification({
  handleSwitchType,
}: Readonly<SwitchToExtendedProgrammeNotificationProps>) {
  const { t } = useTranslation();

  return (
    <Notification type="alert" label={t('projectProgrammeForm.briefNotificationTitle')}>
      <div className="project-programme-notification-content">
        <p>{t('projectProgrammeForm.briefNotificationText')}</p>
        <div>
          <Button
            variant={ButtonVariant.Secondary}
            theme={{ '--background-color': 'var(--color-white)' }}
            onClick={handleSwitchType}
          >
            {t('projectProgrammeForm.switchToExtendedProgramme')}
          </Button>
        </div>
      </div>
    </Notification>
  );
}

export default SwitchToExtendedProgrammeNotification;
