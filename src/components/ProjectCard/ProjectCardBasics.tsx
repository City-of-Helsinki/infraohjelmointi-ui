import ProjectCardBasicsForm from './ProjectCardBasicsForm';
import ScrollToTop from '../shared/ScrollToTop';
import ProjectCardSidePanel from './ProjectCardSidePanel';
import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';

const ProjectCardBasics = () => {
  const projectCard = useAppSelector((state: RootState) => state.projectCard.selectedProjectCard);
  return (
    <div className="project-card-content-container">
      <ScrollToTop />
      <div className="side-panel">
        <ProjectCardSidePanel />
      </div>
      <div className="form-panel">{projectCard && <ProjectCardBasicsForm />}</div>
    </div>
  );
};

export default ProjectCardBasics;
