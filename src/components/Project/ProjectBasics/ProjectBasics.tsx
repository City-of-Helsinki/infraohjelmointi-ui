import ProjectBasicsForm from './ProjectBasicsForm';
import ScrollToTop from '../../shared/ScrollToTop';
import ProjectSidePanel from './ProjectSidePanel';

const ProjectBasics = () => {
  return (
    <div className="flex h-full w-full flex-wrap" data-testid="project-basics">
      <ScrollToTop />
      <div
        className="sticky top-0 flex flex-1 translate-y-[4rem] justify-center"
        data-testid="side-panel"
      >
        <ProjectSidePanel />
      </div>
      <div className=" my-16 flex flex-[2]" data-testid="form-panel">
        <ProjectBasicsForm />
      </div>
    </div>
  );
};

export default ProjectBasics;
