import ProjectBasicsForm from './ProjectBasicsForm';
import ScrollToTop from '../../shared/ScrollToTop';
import ProjectSidePanel from './ProjectSidePanel';

const ProjectBasics = () => {
  return (
    <div className="project-content-container">
      <ScrollToTop />
      <div className="side-panel">
        <ProjectSidePanel />
      </div>
      <div className="form-panel">
        <ProjectBasicsForm />
      </div>
    </div>
  );
};

export default ProjectBasics;
