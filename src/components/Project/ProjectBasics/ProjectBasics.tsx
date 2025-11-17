import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectProjectMode, selectProject } from '@/reducers/projectSlice';
import ProjectSidePanel from './ProjectFormSidePanel/ProjectFormSidePanel';
import ProjectForm from './ProjectForm/ProjectForm';
import './styles.css';

const ProjectBasics = () => {
  const project = useAppSelector(selectProject);
  const projectMode = useAppSelector(selectProjectMode);
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
    <div className="project-basics-container" data-testid="project-basics">
      {(project || projectMode === 'new') && (
        <>
          <div className="flex w-[35%] justify-center">
            <ProjectSidePanel navItems={navItems} pwFolderLink={project?.pwFolderLink} />
          </div>
          <div className="flex w-[65%]" data-testid="form-panel">
            <ProjectForm />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectBasics;
