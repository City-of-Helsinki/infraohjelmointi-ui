import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  getProjectThunk,
  resetProject,
  selectProjectMode,
  selectProject,
  setProjectMode,
  setSelectedProject,
} from '@/reducers/projectSlice';
import ProjectDetailsForm from '@/components/ProjectDetailsForm'
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectToolbar } from '@/components/Project/ProjectToolbar';
import { ProjectHeader } from '@/components/Project/ProjectHeader';
import { selectProjectUpdate } from '@/reducers/eventsSlice';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import _ from 'lodash';

const LOADING_PROJECT = 'loading-project';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const selectedProject = useAppSelector(selectProject);
  const projectUpdate = useAppSelector(selectProjectUpdate);
  const projectMode = useAppSelector(selectProjectMode);

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
        if (res.type.includes('rejected')) {
          navigate('/not-found');
        }
      } catch (e) {
        console.log('Error getting project by id: ', e);
      } finally {
        dispatch(clearLoading(LOADING_PROJECT));
      }
    };

    if (projectId) {
      // if a new project is added after a successfull POST request goes through we want to change the mode to edit
      if (projectMode === 'new') {
        dispatch(setProjectMode('edit'));
      }
      // if project mode is not new then we fetch the project to make sure we got the latest changes
      else {
        getProjectById(projectId);
      }
    } else if (projectMode === 'new') {
      // If the mode is 'new' and there was no project yet, reset the project to make sure selectedProject isn't still in redux
      if (!projectId) {
        dispatch(resetProject());
      }
    } else {
      navigate('/planning');
    }
  }, [projectId, projectMode, navigate, dispatch]);

  return (
    <div className="w-full" data-testid="project-view">
      {(selectedProject || projectMode === 'new') && (
        <>
          <ProjectToolbar />
          <ProjectHeader />
          <ProjectDetailsForm projectMode={projectMode} />
        </>
      )}
    </div>
  );
};

export default ProjectView;
