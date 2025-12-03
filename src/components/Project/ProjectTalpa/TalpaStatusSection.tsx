import { TalpaStatus } from '@/interfaces/talpaInterfaces';
import { TalpaStatusLabel } from './TalpaStatusLabel';
import { Button } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface ITalpaStatusSectionProps {
  status: TalpaStatus;
  onMarkAsSent: () => void;
}

export default function TalpaStatusSection({
  status,
  onMarkAsSent,
}: Readonly<ITalpaStatusSectionProps>) {
  const { t } = useTranslation();

  return (
    <div>
      <TalpaStatusLabel status={status} />
      {status === TalpaStatus.excel_generated && (
        <div className="mt-4">
          <Button onClick={onMarkAsSent}>{t('projectTalpaForm.markAsSent')}</Button>
        </div>
      )}
    </div>
  );
}
