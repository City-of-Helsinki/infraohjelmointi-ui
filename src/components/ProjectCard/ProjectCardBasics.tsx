import { useTranslation } from 'react-i18next';
import { SideNavigation } from '@/components/shared';
import ProjectCardBasicsForm from './ProjectCardBasicsForm';

const ProjectCardBasics = () => {
  const { t } = useTranslation();

  const navItems = [
    {
      route: 'basics',
      label: t('nav.basics'),
    },
  ];

  return (
    <div className="project-card-content-container">
      <div style={{ display: 'flex', width: '30%' }}>
        <SideNavigation navItems={navItems} />
        <hr />
      </div>
      <div style={{ display: 'flex', width: '70%' }}>
        <ProjectCardBasicsForm />
      </div>
    </div>
  );
};

export default ProjectCardBasics;
