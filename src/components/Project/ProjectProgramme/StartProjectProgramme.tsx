import { memo } from 'react';
import { Button, ButtonVariant, Card } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface IStartProjectProgrammeProps {
  onStartProjectProgramme: () => void;
}

function StartProjectProgramme({ onStartProjectProgramme }: Readonly<IStartProjectProgrammeProps>) {
  const { t } = useTranslation();

  return (
    <div className="project-form mx-auto max-w-xl" data-testid="start-project-programme">
      <Card
        heading={t('projectProgramme')}
        text={t('projectProgrammeForm.projectProgrammeNotStarted')}
        theme={{
          '--background-color': 'var(--color-coat-of-arms-light)',
          '--padding-horizontal': '2rem',
          '--padding-vertical': '2rem',
        }}
      >
        <Button
          variant={ButtonVariant.Secondary}
          theme={{ '--background-color': 'var(--color-white)' }}
          onClick={onStartProjectProgramme}
        >
          {t('projectProgrammeForm.startProjectProgramme')}
        </Button>
      </Card>
    </div>
  );
}

export default memo(StartProjectProgramme);
