import { useTranslation } from 'react-i18next';
import { SideNavigation } from '@/components/shared';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import ScrollToTop from '../shared/ScrollToTop';

const ProjectCardBasics = () => {
  const { t } = useTranslation();

  const navItems = [
    {
      route: '#basics',
      label: t('nav.basics'),
    },
    { route: '#schedule', label: t('nav.schedule') },
  ];

  return (
    <div className="project-card-content-container">
      {/* <ScrollToTop /> */}
      <div className="side-panel">
        <SideNavigation navItems={navItems} />
      </div>
      <div className="form-panel">
        <ProjectCardBasicsForm />
      </div>
    </div>
  );
};

export default ProjectCardBasics;
