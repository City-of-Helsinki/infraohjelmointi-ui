import { FC } from 'react';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { IconSaveDiskette } from 'hds-react/icons';
import { SideNavigation } from '../../shared';
import { useAppSelector } from '@/hooks/common';
import { useTranslation } from 'react-i18next';
import { selectUpdated } from '@/reducers/projectSlice';
import './styles.css';

const ProjectSidePanel: FC = () => {
  const updated = useAppSelector(selectUpdated);
  const { t } = useTranslation();
  const navItems = [
    { route: '#basics', label: t('nav.basics') },
    { route: '#status', label: t('nav.status') },
    { route: '#schedule', label: t('nav.schedule') },
    { route: '#financial', label: t('nav.financial') },
    { route: '#responsiblePersons', label: t('nav.responsiblePersons') },
    { route: '#location', label: t('nav.location') },
    { route: '#projectProgram', label: t('nav.projectProgram') },
  ];

  return (
    <div className="project-side-panel">
      <div className="flex justify-center">
        <SideNavigation navItems={navItems} />
      </div>

      {updated && (
        <div className="mt-4 flex justify-center">
          <div className="side-nav">
            <StatusLabel className="save-icon" type="success" iconLeft={<IconSaveDiskette />}>
              {t('savedTime', { time: updated })}
            </StatusLabel>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidePanel;
