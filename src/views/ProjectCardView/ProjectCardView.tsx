import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import ProjectCardHeader from '@/components/ProjectCard/ProjectCardHeader';
import ProjectCardTabs from '@/components/ProjectCard/ProjectCardTabs';
import './styles.css';
import ProjectCardToolbar from '@/components/ProjectCard/ProjectCardToolbar';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getProjectCardsThunk()).then((res) => {
      if (res.type.includes('rejected')) {
        console.log('Call failed, do error stuff!');
      }
    });
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
