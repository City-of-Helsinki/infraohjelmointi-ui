import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getProjectThunk, selectProject } from '@/reducers/projectSlice';
import { TabList } from '@/components/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import { useTranslation } from 'react-i18next';
import { ProjectToolbar } from '@/components/Project/ProjectToolbar';
import { ProjectNotes } from '@/components/Project/ProjectNotes';
import { ProjectHeader } from '@/components/Project/ProjectHeader';

const ProjectView = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const selectedProject = useAppSelector(selectProject);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectThunk(projectId)).then(
        (res) => res.type.includes('rejected') && navigate('/not-found'),
      );
    } else {
      navigate('/planning');
    }
  }, [dispatch, projectId]);

  const navItems: Array<INavigationItem> = [
    { route: 'basics', label: t('basicInfo'), component: <ProjectBasics /> },
    { route: 'notes', label: t('notes'), component: <ProjectNotes /> },
  ];

  return (
    <div className="w-full" data-testid="project-view">
      {selectedProject && (
        <>
          <ProjectToolbar />
          <ProjectHeader />
          <TabList navItems={navItems} />
        </>
      )}
    </div>
  );
};

export default ProjectView;
