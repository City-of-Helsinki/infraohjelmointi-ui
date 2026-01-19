import { useTranslation } from 'react-i18next';
import { ProjectFormSidePanel } from '../ProjectBasics/ProjectFormSidePanel';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import ProjectTalpaForm from './ProjectTalpaForm';
import { markTalpaProjectAsSentThunk, selectTalpaProject } from '@/reducers/talpaSlice';
import TalpaStatusSection from './TalpaStatusSection';

export default function ProjectTalpa() {
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const talpaProject = useAppSelector(selectTalpaProject);
  const dispatch = useAppDispatch();

  const navItems = [
    { route: '#budgetItemNumber', label: t('nav.budgetItemNumber') },
    { route: '#projectIdentifiers', label: t('nav.projectIdentifiers') },
    { route: '#projectSchedule', label: t('nav.projectSchedule') },
    { route: '#projectContacts', label: t('nav.projectContacts') },
    { route: '#projectClasses', label: t('nav.projectClasses') },
  ];

  function handleMarkAsSent() {
    if (talpaProject?.id) {
      dispatch(markTalpaProjectAsSentThunk(talpaProject.id));
    }
  }

  return (
    <div className="flex" data-testid="project-talpa">
      <div className="flex w-[35%] flex-shrink-0 justify-center">
        <ProjectFormSidePanel
          navItems={navItems}
          pwFolderLink={project?.pwFolderLink}
          showSaveIndicator={false}
          formStatusSection={
            talpaProject?.status ? (
              <TalpaStatusSection status={talpaProject.status} onMarkAsSent={handleMarkAsSent} />
            ) : null
          }
        />
      </div>
      <div className="mb-20 w-full pr-4" data-testid="talpa-form">
        <ProjectTalpaForm />
      </div>
    </div>
  );
}
