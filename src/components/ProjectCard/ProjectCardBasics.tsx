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
    {
      route: 'status',
      label: 'Hankkeen tila',
    },
    {
      route: 'status',
      label: 'Hankkeen aikataulu',
    },
    {
      route: 'status',
      label: 'Hankkeen kustannustiedot',
    },
    {
      route: 'status',
      label: 'Hankkeen vastuuhenkilöt',
    },
    {
      route: 'status',
      label: 'Hankkeen sijainti',
    },
    {
      route: 'status',
      label: 'Hankkeen kuvaus',
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

{
  /* <div className="project-card-content-container">
<div style={{ display: 'flex', width: '25%', maxWidth: '264px' }}>
  <SideNavigation navItems={navItems} />
  <hr />
</div>
<div style={{ display: 'flex', width: '75%', marginLeft: 'var(--spacing-layout-2-xl)' }}>
  <ProjectCardBasicsForm />
</div>
</div> */
}
