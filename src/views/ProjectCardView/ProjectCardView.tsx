import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { TabList } from '@/components/shared';
import { useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { ProjectCardBasics } from '@/components/ProjectCard';
import { useTranslation } from 'react-i18next';
import ProjectCardHeader from '@/components/ProjectCard/ProjectCardHeaderForm';
import ProjectCardToolbar from '@/components/ProjectCard/ProjectCardToolbar';
import './styles.css';
import {
  getConstructionPhasesThunk,
  getPlanningPhasesThunk,
  getProjectAreasThunk,
  getProjectPhasesThunk,
  getProjectQualityLevelsThunk,
  getProjectTypesThunk,
  getConstructionPhaseDetailsThunk,
} from '@/reducers/listsSlice';

const ProjectCardView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();

  useEffect(() => {
    dispatch(getProjectCardThunk(projectId || ''));
    dispatch(getProjectTypesThunk());
    dispatch(getProjectPhasesThunk());
    dispatch(getProjectAreasThunk());
    dispatch(getConstructionPhaseDetailsThunk());
    dispatch(getProjectQualityLevelsThunk());
    dispatch(getPlanningPhasesThunk());
    dispatch(getConstructionPhasesThunk());
  }, [dispatch, projectId]);

  const navItems: Array<INavigationItem> = [
    { route: 'basics', label: t('basicInfo'), component: <ProjectCardBasics /> },
  ];

  return (
    <div className="project-card-container">
      <ProjectCardToolbar />
      <ProjectCardHeader />
      <TabList navItems={navItems} />
    </div>
  );
};

export default ProjectCardView;
