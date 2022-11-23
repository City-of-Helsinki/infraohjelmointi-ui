import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { TabsList } from '@/components/shared';
import { useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { ProjectCardBasics, ProjectCardTasks } from '@/components/ProjectCard';
import { useTranslation } from 'react-i18next';
import ProjectCardHeader from '@/components/ProjectCard/ProjectCardHeader';
import ProjectCardToolbar from '@/components/ProjectCard/ProjectCardToolbar';
import './styles.css';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();

  useEffect(() => {
    dispatch(getProjectCardThunk(projectId || ''));
  }, [dispatch, projectId]);

  const tabItems: Array<INavigationItem> = [
    { route: 'basics', label: t('basicInfo'), component: <ProjectCardBasics /> },
    { route: 'tasks', label: t('tasks'), component: <ProjectCardTasks /> },
  ];

  return (
    <div className="project-card-container">
      <ProjectCardToolbar />
      <ProjectCardHeader />
      <TabsList tabItems={tabItems} />
    </div>
  );
};

export default ProjectCardView;
