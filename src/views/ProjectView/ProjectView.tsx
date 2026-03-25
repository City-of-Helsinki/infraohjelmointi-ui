import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectProjectMode } from '@/reducers/projectSlice';
import ProjectDetailsForm from '@/components/ProjectDetailsForm';
import { useNavigate } from 'react-router-dom';
import { ProjectHeader } from '@/components/Project/ProjectHeader';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import {
  clearIsProjectCardLoading,
  clearLoading,
  setIsProjectCardLoading,
  setLoading,
} from '@/reducers/loaderSlice';
import _ from 'lodash';
import useGetProject from '@/hooks/useGetProject';

const LOADING_PROJECT = 'loading-project';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectUpdate = useAppSelector(selectProjectUpdate);
  const projectMode = useAppSelector(selectProjectMode);
  const {
    isFetching: isProjectFetching,
    isError: isProjectError,
    data: project,
    refetch,
    shouldFetchProject,
  } = useGetProject();

  // Refetch project data when there is a project-update event
  useEffect(() => {
    const updatedProject = projectUpdate?.project;

    if (!updatedProject) {
      return;
    }

    // Don't refetch if the user is viewing another project
    if (updatedProject.id !== project?.id) {
      return;
    }

    // Refetch if the project-update event gives different values
    if (!_.isEqual(project, updatedProject)) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectUpdate]);

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

  // Clear view-specific loaders if route changes during a fetch/error transition.
  useEffect(() => {
    return () => {
      dispatch(clearLoading(LOADING_PROJECT));
      dispatch(clearIsProjectCardLoading());
    };
  }, [dispatch]);

  return (
    <div className="w-full" data-testid="project-view">
      {(project || projectMode === 'new') && (
        <>
          <ProjectHeader project={project ?? null} />
          <ProjectDetailsForm projectMode={projectMode} />
        </>
      )}
    </div>
  );
};

export default ProjectView;
