import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import ProjectCardHeader from '@/components/ProjectCard/ProjectCardHeader';
import ProjectCardTabs from '@/components/ProjectCard/ProjectCardTabs';
import './styles.css';
import ProjectCardToolbar from '@/components/ProjectCard/ProjectCardToolbar';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();
  const projectCardId = '79786137-d73e-471b-a7a0-c366967b7158';

  useEffect(() => {
    dispatch(getProjectCardThunk(projectCardId));
  }, [dispatch]);

  return (
    <div className="project-card-container">
      <ProjectCardToolbar />
      <ProjectCardHeader />
      <ProjectCardTabs />
    </div>
  );
};

export default ProjectCardView;
