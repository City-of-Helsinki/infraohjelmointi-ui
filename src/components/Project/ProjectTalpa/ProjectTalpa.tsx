import { useTranslation } from 'react-i18next';
import { skipToken } from '@reduxjs/toolkit/query';
import { ProjectFormSidePanel } from '../ProjectBasics/ProjectFormSidePanel';
import ProjectTalpaForm from './ProjectTalpaForm';
import {
  useGetTalpaProjectOpeningByProjectQuery,
  useMarkTalpaProjectAsSentMutation,
} from '@/api/talpaApi';
import TalpaStatusSection from './TalpaStatusSection';
import useGetProject from '@/hooks/useGetProject';

export default function ProjectTalpa() {
  const { t } = useTranslation();
  const { data: project } = useGetProject();
  const { data: talpaProject } = useGetTalpaProjectOpeningByProjectQuery(project?.id ?? skipToken);
  const [markTalpaProjectAsSent] = useMarkTalpaProjectAsSentMutation();

  const navItems = [
    { route: '#budgetItemNumber', label: t('nav.budgetItemNumber') },
    { route: '#projectIdentifiers', label: t('nav.projectIdentifiers') },
    { route: '#projectSchedule', label: t('nav.projectSchedule') },
    { route: '#projectContacts', label: t('nav.projectContacts') },
    { route: '#projectClasses', label: t('nav.projectClasses') },
  ];

  function handleMarkAsSent() {
    if (talpaProject?.id) {
      markTalpaProjectAsSent(talpaProject.id);
    }
  }

  return (
    <div className="flex" data-testid="project-talpa">
      <div className="flex w-[35%] shrink-0 justify-center">
        <ProjectFormSidePanel
          navItems={navItems}
          project={project ?? null}
          showSaveIndicator={false}
          formStatusSection={
            talpaProject?.status ? (
              <TalpaStatusSection status={talpaProject.status} onMarkAsSent={handleMarkAsSent} />
            ) : null
          }
        />
      </div>
      <div className="mb-20 w-full pr-4" data-testid="talpa-form">
        <ProjectTalpaForm project={project ?? null} />
      </div>
    </div>
  );
}
