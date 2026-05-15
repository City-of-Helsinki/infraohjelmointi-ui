import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';
import { IconArrowTopRight, IconCheckCircle, IconHammers, IconPen, StatusLabel } from 'hds-react';

interface IConstructionHandoverStatusLabelProps {
  status: ConstructionHandoverStatus;
}

function ConstructionHandoverStatusLabel({
  status,
}: Readonly<IConstructionHandoverStatusLabelProps>) {
  const { t } = useTranslation();

  if (status === ConstructionHandoverStatus.DRAFT) {
    return (
      <StatusLabel iconStart={<IconPen />}>
        {t('constructionHandoverForm.status.draft')}
      </StatusLabel>
    );
  }
  if (status === ConstructionHandoverStatus.SUBMITTED_TO_PROGRAMMER) {
    return (
      <StatusLabel type="info" iconStart={<IconArrowTopRight />}>
        {t('constructionHandoverForm.status.submittedToProgrammer')}
      </StatusLabel>
    );
  }
  if (status === ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION) {
    return (
      <StatusLabel type="info" iconStart={<IconArrowTopRight />}>
        {t('constructionHandoverForm.status.submittedToConstruction')}
      </StatusLabel>
    );
  }
  if (status === ConstructionHandoverStatus.PROJECT_MANAGER_NAMED) {
    return (
      <StatusLabel type="info" iconStart={<IconHammers />}>
        {t('constructionHandoverForm.status.projectManagerNamed')}
      </StatusLabel>
    );
  }
  if (status === ConstructionHandoverStatus.MOVED_TO_CONSTRUCTION_PREPARATION) {
    return (
      <StatusLabel type="success" iconStart={<IconCheckCircle />}>
        {t('constructionHandoverForm.status.movedToConstructionPreparation')}
      </StatusLabel>
    );
  }

  return null;
}

export default memo(ConstructionHandoverStatusLabel);
