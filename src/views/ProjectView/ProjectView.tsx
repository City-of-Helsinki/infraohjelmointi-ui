import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  resetProject,
  selectProjectMode,
  selectProject,
  setProjectMode,
  setSelectedProject,
} from '@/reducers/projectSlice';
import ProjectDetailsForm from '@/components/ProjectDetailsForm';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectHeader } from '@/components/Project/ProjectHeader';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import {
  clearIsProjectCardLoading,
  clearLoading,
  setIsProjectCardLoading,
  setLoading,
} from '@/reducers/loaderSlice';
import { selectUser } from '@/reducers/authSlice';
import _ from 'lodash';
import { useGetProjectByIdQuery } from '@/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';

const LOADING_PROJECT = 'loading-project';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const selectedProject = useAppSelector(selectProject);
  const projectUpdate = useAppSelector(selectProjectUpdate);
  const projectMode = useAppSelector(selectProjectMode);
  const user = useAppSelector(selectUser);
  const shouldFetchProject = Boolean(projectId && user && projectMode !== 'new');
  const { isFetching: isProjectFetching, isError: isProjectError } = useGetProjectByIdQuery(
    shouldFetchProject && projectId ? projectId : skipToken,
  );

  // Update selectedProject to redux with a project-update event
  useEffect(() => {
    const project = projectUpdate?.project;

    if (!project) {
      return;
    }

    // Don't update the selectedProject if the user is viewing another project
    if (project.id !== selectedProject?.id) {
      return;
    }

    // Update the selectedProject if the project-update event gives different values
    if (!_.isEqual(project, selectedProject)) {
      dispatch(setSelectedProject(project));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectUpdate]);

  useEffect(() => {
    if (projectMode === 'new') {
      if (projectId && user) {
        dispatch(setProjectMode('edit'));
      } else if (!projectId) {
        dispatch(resetProject());
      }
    }
  }, [projectId, projectMode, user, dispatch]);

  useEffect(() => {
    if (!shouldFetchProject) {
      dispatch(clearLoading(LOADING_PROJECT));
      dispatch(clearIsProjectCardLoading());
      return;
    }

    if (isProjectFetching) {
      dispatch(setLoading({ text: 'Loading project', id: LOADING_PROJECT }));
      dispatch(setIsProjectCardLoading());
    } else {
      dispatch(clearLoading(LOADING_PROJECT));
      dispatch(clearIsProjectCardLoading());
    }
  }, [dispatch, isProjectFetching, shouldFetchProject]);

  useEffect(() => {
    if (shouldFetchProject && isProjectError) {
      navigate('/not-found');
    }
  }, [isProjectError, navigate, shouldFetchProject]);

  return (
    <div className="w-full" data-testid="project-view">
      {(selectedProject || projectMode === 'new') && (
        <>
          <ProjectHeader />
          <ProjectDetailsForm projectMode={projectMode} />
        </>
      )}
    </div>
  );
};

export default ProjectView;
