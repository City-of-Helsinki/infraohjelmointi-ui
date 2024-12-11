import { IconMap, IconPlusCircle, IconShare } from 'hds-react/icons';
import { Toolbar } from '../../shared';
import { Button, ButtonVariant } from 'hds-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ProjectToolbar = () => {
  const { t } = useTranslation();
  const circleIcon = useMemo(() => <IconPlusCircle />, []);
  const shareIcon = useMemo(() => <IconShare />, []);
  return (
    <Toolbar
      left={
        <>
          <Button
            variant={ButtonVariant.Supplementary}
            className="toolbar-button"
            iconStart={circleIcon}
            disabled={true}
          >
            {t('new')}
          </Button>
          <Button
            variant={ButtonVariant.Supplementary}
            className="toolbar-button"
            iconStart={shareIcon}
            disabled={true}
          >
            {t('shareProject')}
          </Button>
        </>
      }
      right={<IconMap aria-label="map" data-testid="test" />}
    />
  );
};

export default ProjectToolbar;
