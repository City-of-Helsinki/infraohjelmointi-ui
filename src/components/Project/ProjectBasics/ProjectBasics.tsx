import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import ProjectSidePanel from './ProjectFormSidePanel/ProjectFormSidePanel';
import ProjectForm from './ProjectForm/ProjectForm';
import { useState } from 'react';
import './styles.css';

const ProjectBasics = () => {
  const project = useAppSelector(selectProject);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="project-basics-container" data-testid="project-basics">
      {project && (
        <>
          <div className="flex w-[35%] justify-center">
            <ProjectSidePanel pwFolderLink={project.pwFolderLink} isSaving={isSaving} />
          </div>
          <div className="flex w-[65%]" data-testid="form-panel">
            <ProjectForm setIsSaving={setIsSaving} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectBasics;
