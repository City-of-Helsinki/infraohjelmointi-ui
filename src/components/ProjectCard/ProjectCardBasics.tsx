import { useTranslation } from 'react-i18next';
import { SideNavigation } from '@/components/shared';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import ScrollToTop from '../shared/ScrollToTop';
import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';

const ProjectCardBasics = () => {
  const { t } = useTranslation();
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);

  const navItems = [
    {
      route: '#basics',
      label: t('nav.basics'),
    },
    { route: '#schedule', label: t('nav.schedule') },
  ];

  return (
    <div className="project-card-content-container">
      <ScrollToTop />
      <div className="side-panel">
        <SideNavigation navItems={navItems} />
      </div>
      {projectCard && (
        <div className="form-panel">
          <ProjectCardBasicsForm />
        </div>
      )}
    </div>
  );
};

export default ProjectCardBasics;
