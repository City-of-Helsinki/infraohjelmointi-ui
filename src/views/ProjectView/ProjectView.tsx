import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  getProjectThunk,
  resetProject,
  selectIsNewProject,
  selectProject,
  setIsNewProject,
  setSelectedProject,
} from '@/reducers/projectSlice';
import { TabList } from '@/components/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import { ProjectToolbar } from '@/components/Project/ProjectToolbar';
import { ProjectNotes } from '@/components/Project/ProjectNotes';
import { ProjectHeader } from '@/components/Project/ProjectHeader';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import _ from 'lodash';

const LOADING_PROJECT = 'loading-project';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const selectedProject = useAppSelector(selectProject);
  const projectUpdate = useAppSelector(selectProjectUpdate);
  const isNewProject = useAppSelector(selectIsNewProject);

  // Update selectedProject to redux with a project-update event
  useEffect(() => {
    if (projectUpdate?.project && !_.isEqual(projectUpdate?.project, selectedProject)) {
      dispatch(setSelectedProject(projectUpdate.project));
    }
  }, [projectUpdate]);

  useEffect(() => {
    if (projectId) {
      dispatch(setIsNewProject(false));
      dispatch(setLoading({ text: 'Loading project', id: LOADING_PROJECT }));
      dispatch(getProjectThunk(projectId))
        .then((res) => res.type.includes('rejected') && navigate('/not-found'))
        .catch(Promise.reject)
        .finally(() => dispatch(clearLoading(LOADING_PROJECT)));
    } else if (!isNewProject) {
      navigate('/planning');
    }
    dispatch(resetProject());
    // if !projectId and newProject
  }, [projectId, isNewProject, navigate, dispatch]);

  const getNavItems = useCallback(() => {
    const navItems: Array<INavigationItem> = [
      {
        route: isNewProject ? 'new' : 'basics',
        label: t('basicInfo'),
        component: <ProjectBasics />,
      },
    ];
    if (!isNewProject) {
      navItems.push({ route: 'notes', label: t('notes'), component: <ProjectNotes /> });
    }
    return navItems;
  }, [isNewProject]);

  return (
    <div className="w-full" data-testid="project-view">
      {(selectedProject || isNewProject) && (
        <>
          <ProjectToolbar />
          <ProjectHeader />
          <TabList navItems={getNavItems()} />
        </>
      )}
    </div>
  );
};

export default ProjectView;
