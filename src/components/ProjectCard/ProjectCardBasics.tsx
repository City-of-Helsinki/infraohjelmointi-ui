import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import ScrollToTop from '../shared/ScrollToTop';
import ProjectCardSidePanel from './ProjectCardSidePanel';

const ProjectCardBasics = () => {
  return (
    <div className="project-card-content-container">
      <ScrollToTop />
      <div className="side-panel">
        <ProjectCardSidePanel />
      </div>
      <div className="form-panel">
        <ProjectCardBasicsForm />
      </div>
    </div>
  );
};

export default ProjectCardBasics;
