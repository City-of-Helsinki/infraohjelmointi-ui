import { FC } from 'react';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { IconSaveDiskette } from 'hds-react/icons';
import { SideNavigation } from '../../shared';
import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { useTranslation } from 'react-i18next';

const ProjectSidePanel: FC = () => {
  const updated = useAppSelector((state: RootState) => state.project.updated);
  const { t } = useTranslation();
  const navItems = [
    {
      route: '#basics',
      label: t('nav.basics'),
    },
    { route: '#status', label: t('nav.status') },
    { route: '#schedule', label: t('nav.schedule') },
    { route: '#financial', label: t('nav.financial') },
  ];

  return (
    <div className="side-panel-container">
      <div className="nav-container">
        <SideNavigation navItems={navItems} />
      </div>

      {updated && (
        <div className="label-container">
          <div className="side-nav">
            <StatusLabel type="success" iconLeft={<IconSaveDiskette />}>
              {t('savedTime', { time: updated })}
            </StatusLabel>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidePanel;
