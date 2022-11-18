import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import ProjectCardHeader from '@/components/ProjectCard/ProjectCardHeader';
import ProjectCardTabs from '@/components/ProjectCard/ProjectCardTabs';
import Loader from '@/components/Loader';
import ProjectCardToolbar from '@/components/ProjectCard/ProjectCardToolbar';
import './styles.css';
import { useParams } from 'react-router-dom';
import { clearLoading, setLoading } from '@/reducers/loadingSlice';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams();

  useEffect(() => {
    dispatch(setLoading('Ladataan sivua'));
    dispatch(getProjectCardThunk(projectId || '')).finally(() => dispatch(clearLoading()));
  }, [dispatch]);

  return (
    <Loader>
      <div className="project-card-container">
        <ProjectCardToolbar />
        <ProjectCardHeader />
        <ProjectCardTabs />
      </div>
    </Loader>
  );
};

export default ProjectCardView;
