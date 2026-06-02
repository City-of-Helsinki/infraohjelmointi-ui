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
import HandoverFinalizingForm from './HandoverFinalizingForm';
import { ConstructionHandoverStatus } from '@/interfaces/constructionHandoverInterfaces';

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

  const showHandoverFinalizingForm =
    isConstructionHandoverStarted &&
    [
      ConstructionHandoverStatus.SUBMITTED_TO_CONSTRUCTION,
      ConstructionHandoverStatus.PROJECT_MANAGER_NAMED,
    ].includes(constructionHandover.status);

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
          <>
            {showHandoverFinalizingForm && (
              <HandoverFinalizingForm constructionHandover={constructionHandover} />
            )}

            <ConstructionHandoverForm constructionHandover={constructionHandover} />
          </>
        ) : (
          <StartConstructionHandover onStartHandover={handleStartHandover} />
        )}
      </div>
    </div>
  );
}
