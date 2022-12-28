import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { TabList } from '@/components/shared';
import { useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { ProjectCardBasics } from '@/components/ProjectCard/ProjectCardBasics';
import { useTranslation } from 'react-i18next';
import './styles.css';
import {
  getConstructionPhasesThunk,
  getPlanningPhasesThunk,
  getProjectAreasThunk,
  getProjectPhasesThunk,
  getProjectQualityLevelsThunk,
  getProjectTypesThunk,
  getConstructionPhaseDetailsThunk,
  getProjectCategoriesThunk,
  getProjectRisksThunk,
} from '@/reducers/listsSlice';
import { ProjectCardHeaderForm } from '@/components/ProjectCard/ProjectCardHeader';
import { ProjectCardToolbar } from '@/components/ProjectCard/ProjectCardToolbar';
import { ProjectCardNotes } from '@/components/ProjectCard/ProjectCardNotes';

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
    dispatch(getProjectCategoriesThunk());
    dispatch(getProjectRisksThunk());
    dispatch(getProjectQualityLevelsThunk());
    dispatch(getPlanningPhasesThunk());
    dispatch(getConstructionPhasesThunk());
  }, [dispatch, projectId]);

  const navItems: Array<INavigationItem> = [
    { route: 'basics', label: t('basicInfo'), component: <ProjectCardBasics /> },
    { route: 'notes', label: t('notes'), component: <ProjectCardNotes /> },
  ];

  return (
    <div className="project-card-container">
      <ProjectCardToolbar />
      <ProjectCardHeaderForm />
      <TabList navItems={navItems} />
    </div>
  );
};

export default ProjectCardView;
