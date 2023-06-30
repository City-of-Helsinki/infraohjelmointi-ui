import { IconMap, IconPlusCircle, IconShare } from 'hds-react/icons';
import { Toolbar } from '../../shared';
import { Button } from 'hds-react';
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
            variant="supplementary"
            className="toolbar-button"
            iconLeft={circleIcon}
            disabled={true}
          >
            {t('new')}
          </Button>
          <Button
            variant="supplementary"
            className="toolbar-button"
            iconLeft={shareIcon}
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
