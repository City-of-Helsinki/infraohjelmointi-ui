import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { getProjectThunk } from '@/reducers/projectSlice';
import { TabList } from '@/components/shared';
import { useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import { useTranslation } from 'react-i18next';

import {
  getConstructionPhasesThunk,
  getPlanningPhasesThunk,
  getProjectAreasThunk,
  getProjectQualityLevelsThunk,
  getProjectTypesThunk,
  getConstructionPhaseDetailsThunk,
  getProjectRisksThunk,
  getResponsibleZonesThunk,
} from '@/reducers/listsSlice';
import { ProjectToolbar } from '@/components/Project/ProjectToolbar';
import { ProjectNotes } from '@/components/Project/ProjectNotes';
import { ProjectHeader } from '@/components/Project/ProjectHeader';
import { getHashTagsThunk } from '@/reducers/hashTagsSlice';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();

  useEffect(() => {
    dispatch(getProjectThunk(projectId || ''));
    dispatch(getHashTagsThunk());
    dispatch(getProjectTypesThunk());
    dispatch(getProjectAreasThunk());
    dispatch(getConstructionPhaseDetailsThunk());
    dispatch(getProjectRisksThunk());
    dispatch(getProjectQualityLevelsThunk());
    dispatch(getPlanningPhasesThunk());
    dispatch(getConstructionPhasesThunk());
    dispatch(getResponsibleZonesThunk());
  }, [dispatch, projectId]);

  const navItems: Array<INavigationItem> = [
    { route: 'basics', label: t('basicInfo'), component: <ProjectBasics /> },
    { route: 'notes', label: t('notes'), component: <ProjectNotes /> },
  ];

  return (
    <div className="w-full" data-testid="project-view">
      <ProjectToolbar />
      <ProjectHeader />
      <TabList navItems={navItems} />
    </div>
  );
};

export default ProjectView;
