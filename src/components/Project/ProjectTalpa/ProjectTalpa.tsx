import { useTranslation } from 'react-i18next';
import { ProjectFormSidePanel } from '../ProjectBasics/ProjectFormSidePanel';
import { useAppSelector } from '@/hooks/common';
import { selectProject } from '@/reducers/projectSlice';
import ProjectTalpaForm from './ProjectTalpaForm';

export default function ProjectTalpa() {
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);

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
        />
      </div>
      <div className="w-full pr-4" data-testid="talpa-form">
        <ProjectTalpaForm />
      </div>
    </div>
  );
}
