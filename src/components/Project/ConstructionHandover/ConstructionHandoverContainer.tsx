import { useTranslation } from 'react-i18next';
import StartConstructionHandover from './StartConstructionHandover';
import ConstructionHandoverForm from './ConstructionHandoverForm';
import { ProjectFormSidePanel } from '../ProjectBasics/ProjectFormSidePanel';
import useGetProject from '@/hooks/useGetProject';

export default function ConstructionHandoverContainer() {
  const { t } = useTranslation();
  const { data: project } = useGetProject();
  const isConstructionHandoverStarted = true; // NOTE: Placeholder, will be implemented later based on if construction handover data is available for the project

  const navItems = [
    { route: '#nameAndDescription', label: t('nav.nameAndDescription') },
    { route: '#projectSchedule', label: t('nav.projectSchedule') },
    { route: '#constructionHandoverContacts', label: t('nav.constructionHandoverContacts') },
  ];

  const handleStartHandover = () => {
    // NOTE: Will be implemented later
  };

  return (
    <div className="flex" data-testid="construction-handover-container">
      <div className="flex w-[35%] flex-shrink-0 justify-center">
        <ProjectFormSidePanel
          navItems={navItems}
          project={null}
          showSaveIndicator={false}
          showPwFolderLink={false}
        />
      </div>
      <div className="project-form max-w-xl pr-4" data-testid="construction-handover-form">
        {!isConstructionHandoverStarted ? (
          <StartConstructionHandover onStartHandover={handleStartHandover} />
        ) : (
          <ConstructionHandoverForm project={project ?? null} />
        )}
      </div>
    </div>
  );
}
