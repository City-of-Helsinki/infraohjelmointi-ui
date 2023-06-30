import { FC, memo } from 'react';
import { SideNavigation } from '../../../shared';
import { useTranslation } from 'react-i18next';
import PWContainer from './PWContainer';
import SaveIndicator from './SaveIndicator';
import './styles.css';

interface IProjectFormSidePanelProps {
  pwFolderLink?: string | null;
}

const ProjectFormSidePanel: FC<IProjectFormSidePanelProps> = ({ pwFolderLink }) => {
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
    // This "extra" div is here so that the side-panel-container's sticky position works
    <div>
      <div className="project-form-side-panel-container" data-testid="side-panel">
        <div className="project-form-side-panel">
          <div className="side-navigation">
            <SideNavigation navItems={navItems} />
          </div>
          <PWContainer pwFolderLink={pwFolderLink} />
          <SaveIndicator />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFormSidePanel);
