import { useTranslation } from 'react-i18next';
import { ProjectFormSidePanel } from '../ProjectBasics/ProjectFormSidePanel';
import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import ProjectTalpaForm from './ProjectTalpaForm';
import { TalpaStatusLabel } from './TalpaStatusLabel';
import { selectTalpaProject } from '@/reducers/talpaSlice';

export default function ProjectTalpa() {
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const talpaProject = useAppSelector(selectTalpaProject);

  const navItems = [
    { route: '#budgetItemNumber', label: t('nav.budgetItemNumber') },
    { route: '#projectIdentifiers', label: t('nav.projectIdentifiers') },
    { route: '#projectSchedule', label: t('nav.projectSchedule') },
    { route: '#projectContacts', label: t('nav.projectContacts') },
    { route: '#projectClasses', label: t('nav.projectClasses') },
  ];

  return (
    <div className="flex" data-testid="project-talpa">
      <div className="flex w-[35%] flex-shrink-0 justify-center">
        <ProjectFormSidePanel
          navItems={navItems}
          pwFolderLink={project?.pwFolderLink}
          showSaveIndicator={false}
          formStatusSection={
            talpaProject?.status ? <TalpaStatusLabel status={talpaProject.status} /> : null
          }
        />
      </div>
      <div className="mb-20 w-full pr-4" data-testid="talpa-form">
        <ProjectTalpaForm />
      </div>
    </div>
  );
}
