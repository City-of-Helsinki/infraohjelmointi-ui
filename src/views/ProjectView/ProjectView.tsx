import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectThunk } from '@/reducers/projectSlice';
import { TabList } from '@/components/shared';
import { useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
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
import { ProjectToolbar } from '@/components/Project/ProjectToolbar';
import { ProjectNotes } from '@/components/Project/ProjectNotes';
// FIXME: the import statement for ProjectHeader index.ts doesn't work for some reason
// webpack gives an error from a row that doesn't exist
import ProjectHeader from '@/components/Project/ProjectHeader/ProjectHeader';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();

  useEffect(() => {
    dispatch(getProjectThunk(projectId || ''));
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
    { route: 'basics', label: t('basicInfo'), component: <ProjectBasics /> },
    { route: 'notes', label: t('notes'), component: <ProjectNotes /> },
  ];

  return (
    <div className="project-container">
      <ProjectToolbar />
      <ProjectHeader />
      <TabList navItems={navItems} />
    </div>
  );
};

export default ProjectView;
