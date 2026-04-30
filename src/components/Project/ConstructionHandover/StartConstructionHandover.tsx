import { Button, ButtonVariant, Card } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface IStartConstructionHandoverProps {
  onStartHandover: () => void;
}

export default function StartConstructionHandover({
  onStartHandover,
}: Readonly<IStartConstructionHandoverProps>) {
  const { t } = useTranslation();

  return (
    <Card
      heading={t('constructionHandover')}
      text={t('constructionHandoverForm.constructionHandoverNotStarted')}
      theme={{
        '--background-color': 'var(--color-coat-of-arms-light)',
        '--padding-horizontal': '2rem',
        '--padding-vertical': '2rem',
      }}
    >
      <Button
        variant={ButtonVariant.Secondary}
        theme={{ '--background-color': 'var(--color-white)' }}
        onClick={onStartHandover}
      >
        {t('constructionHandoverForm.startConstructionHandover')}
      </Button>
    </Card>
  );
}
