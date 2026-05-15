import { useTranslation } from 'react-i18next';
import StartConstructionHandover from './StartConstructionHandover';
import ConstructionHandoverForm from './ConstructionHandoverForm';
import { ProjectFormSidePanel } from '../ProjectBasics/ProjectFormSidePanel';
import useGetProject from '@/hooks/useGetProject';
import {
  useGetConstructionHandoversByProjectQuery,
  usePostConstructionHandoverMutation,
} from '@/api/constructionHandoverApi';
import { skipToken } from '@reduxjs/toolkit/query';
import ConstructionHandoverStatusLabel from './ConstructionHandoverStatusLabel';

export default function ConstructionHandoverContainer() {
  const { t } = useTranslation();
  const { data: project } = useGetProject();
  const { data: constructionHandovers, isLoading } = useGetConstructionHandoversByProjectQuery(
    project?.id ?? skipToken,
  );
  // NOTE: Currently there can only be one construction handover per project, so we take the first one if it exists.
  // If in the future there can be multiple handovers, this will need to be changed.
  const constructionHandover =
    constructionHandovers && constructionHandovers.length > 0 ? constructionHandovers[0] : null;
  const [postConstructionHandover] = usePostConstructionHandoverMutation();
  const isConstructionHandoverStarted = constructionHandover !== null;

  const navItems = [
    { route: '#nameAndDescription', label: t('nav.nameAndDescription') },
    { route: '#projectSchedule', label: t('nav.projectSchedule') },
    { route: '#constructionHandoverContacts', label: t('nav.constructionHandoverContacts') },
  ];

  const handleStartHandover = () => {
    if (project?.id) {
      postConstructionHandover({
        project: project.id,
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex" data-testid="construction-handover-container">
      <div className="flex w-[35%] flex-shrink-0 justify-center">
        <ProjectFormSidePanel
          navItems={navItems}
          project={null}
          showSaveIndicator={false}
          showPwFolderLink={false}
          formStatusSection={
            constructionHandover ? (
              <ConstructionHandoverStatusLabel status={constructionHandover.status} />
            ) : null
          }
        />
      </div>
      <div className="project-form max-w-xl pr-4" data-testid="construction-handover-form">
        {isConstructionHandoverStarted ? (
          <ConstructionHandoverForm
            constructionHandover={constructionHandover}
            project={project ?? null}
          />
        ) : (
          <StartConstructionHandover onStartHandover={handleStartHandover} />
        )}
      </div>
    </div>
  );
}
