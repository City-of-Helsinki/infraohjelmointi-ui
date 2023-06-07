import ProjectBasicsForm from './ProjectBasicsForm';
// import ScrollToTop from '../../shared/ScrollToTop';
import ProjectSidePanel from './ProjectSidePanel';
import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';

const ProjectBasics = () => {
  const project = useAppSelector(selectProject);

  return (
    <div className="project-basics-container" data-testid="project-basics">
      {/* <ScrollToTop /> */}
      {project && (
        <>
          <div className="flex flex-1 justify-center">
            {/* This "extra" div is here so that the side-panel-container's sticky position works */}
            <div>
              <div className="side-panel-container " data-testid="side-panel">
                <ProjectSidePanel pwFolderLink={project.pwFolderLink} />
              </div>
            </div>
          </div>

          <div className="my-16 flex flex-[2]" data-testid="form-panel">
            <ProjectBasicsForm />
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectBasics;
