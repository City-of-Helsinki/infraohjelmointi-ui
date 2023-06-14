import { FC } from 'react';
import { SideNavigation } from '../../../shared';
import { useAppSelector } from '@/hooks/common';
import { useTranslation } from 'react-i18next';
import { selectUpdated } from '@/reducers/projectSlice';
import PWContainer from './PWContainer';
import SaveIndicator from './SaveIndicator';
import './styles.css';

interface IProjectFormSidePanelProps {
  pwFolderLink?: string | null;
}

const ProjectFormSidePanel: FC<IProjectFormSidePanelProps> = ({ pwFolderLink }) => {
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
    // This "extra" div is here so that the side-panel-container's sticky position works
    <div>
      <div className="project-form-side-panel-container" data-testid="side-panel">
        <div className="project-form-side-panel">
          <div className="side-navigation">
            <SideNavigation navItems={navItems} />
          </div>
          {updated && <SaveIndicator />}
          <PWContainer pwFolderLink={pwFolderLink} />
        </div>
      </div>
    </div>
  );
};

export default ProjectFormSidePanel;
