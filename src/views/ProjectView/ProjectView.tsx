import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  getProjectThunk,
  resetProject,
  selectProjectMode,
  selectProject,
  setProjectMode,
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
import { selectUser } from '@/reducers/authSlice';
import _ from 'lodash';

const LOADING_PROJECT = 'loading-project';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const selectedProject = useAppSelector(selectProject);
  const projectUpdate = useAppSelector(selectProjectUpdate);
  const projectMode = useAppSelector(selectProjectMode);
  const user = useAppSelector(selectUser);

  // Update selectedProject to redux with a project-update event
  useEffect(() => {
    const project = projectUpdate?.project;

    if (!project) {
      return;
    }

    // Don't update the selectedProject if the user is viewing another project
    if (selectedProject && project.id !== selectedProject.id) {
      return;
    }

    // Update the selectedProject if the project-update event gives different values
    if (!_.isEqual(project, selectedProject)) {
      dispatch(setSelectedProject(project));
    }
  }, [projectUpdate]);

  useEffect(() => {
    const getProjectById = async (id: string) => {
      dispatch(setLoading({ text: 'Loading project', id: LOADING_PROJECT }));

      try {
        const res = await dispatch(getProjectThunk(id));
        if (res.type.includes('rejected') && projectId && user) {
          // If the project is not found
          navigate('/not-found');
        }
      } catch (e) {
        console.log('Error getting project by id: ', e);
      } finally {
        dispatch(clearLoading(LOADING_PROJECT));
      }
    };

    // Before loading user information, check user is authenticated to make project fetch successfully.
    if (projectId && user) {
      // If a new project is added after a successfull POST request goes through we want to change the mode to edit
      if (projectMode === 'new') {
        dispatch(setProjectMode('edit'));
      }
      // If project mode is not new then we fetch the project to make sure we got the latest changes
      else {
        getProjectById(projectId);
      }
    } else if (projectMode === 'new') {
      // If the mode is 'new' and there was no project yet, reset the project to make sure selectedProject isn't still in redux
      if (!projectId) {
        dispatch(resetProject());
      }
    }
  }, [projectId, projectMode, user]);

  const getNavItems = useCallback(() => {
    const navItems: Array<INavigationItem> = [
      {
        route: projectMode === 'new' ? 'new' : 'basics',
        label: t('basicInfo'),
        component: <ProjectBasics />,
      },
    ];
    if (projectMode !== 'new') {
      navItems.push({ route: 'notes', label: t('notes'), component: <ProjectNotes /> });
    }
    return navItems;
  }, [projectMode]);

  return (
    <div className="w-full" data-testid="project-view">
      {(selectedProject || projectMode === 'new') && (
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
