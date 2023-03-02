import ProjectBasicsForm from './ProjectBasicsForm';
import ScrollToTop from '../../shared/ScrollToTop';
import ProjectSidePanel from './ProjectSidePanel';

const ProjectBasics = () => {
  return (
    <div className="project-basics-container" data-testid="project-basics">
      <ScrollToTop />
      <div className="side-panel-container" data-testid="side-panel">
        <ProjectSidePanel />
      </div>
      <div className=" my-16 flex flex-[2]" data-testid="form-panel">
        <ProjectBasicsForm />
      </div>
    </div>
  );
};

export default ProjectBasics;
