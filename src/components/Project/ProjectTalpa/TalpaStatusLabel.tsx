import { useTranslation } from 'react-i18next';
import { IconAlertCircle, IconArrowTopRight, IconCheckCircle, StatusLabel } from 'hds-react';
import { TalpaStatus } from '@/interfaces/talpaInterfaces';

interface ITalpaStatusLabelProps {
  status: TalpaStatus;
}

export function TalpaStatusLabel({ status }: ITalpaStatusLabelProps) {
  const { t } = useTranslation();

  if (status === TalpaStatus.excel_generated) {
    return (
      <StatusLabel iconStart={<IconAlertCircle />}>
        {t('projectTalpaForm.excelGenerated')}
      </StatusLabel>
    );
  }

  if (status === TalpaStatus.sent_to_talpa) {
    return (
      <StatusLabel iconStart={<IconArrowTopRight />}>{t('projectTalpaForm.excelSent')}</StatusLabel>
    );
  }

  if (status === TalpaStatus.project_number_opened) {
    return (
      <StatusLabel type="success" iconStart={<IconCheckCircle />}>
        {t('projectTalpaForm.projectOpened')}
      </StatusLabel>
    );
  }

  return null;
}
