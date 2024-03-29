import { useAppSelector } from '@/hooks/common';
import { selectProjectMode, selectProject } from '@/reducers/projectSlice';
import ProjectSidePanel from './ProjectFormSidePanel/ProjectFormSidePanel';
import ProjectForm from './ProjectForm/ProjectForm';
import './styles.css';

const ProjectBasics = () => {
  const project = useAppSelector(selectProject);
  const projectMode = useAppSelector(selectProjectMode);
  return (
    <div className="project-basics-container" data-testid="project-basics">
      {(project || projectMode === 'new') && (
        <>
          <div className="flex w-[35%] justify-center">
            <ProjectSidePanel pwFolderLink={project?.pwFolderLink} />
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
