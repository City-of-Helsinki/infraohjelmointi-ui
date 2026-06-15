import { FC, memo } from 'react';
import { Button, ButtonVariant } from 'hds-react';
import { IconEye } from 'hds-react/icons/';
import { useTranslation } from 'react-i18next';
import { SideNavigation } from '../../../shared';
import PWContainer from './PWContainer';
import SaveIndicator from './SaveIndicator';
import { INavigationItem } from '@/interfaces/common';
import './styles.css';
import { IProject } from '@/interfaces/projectInterfaces';

interface IProjectFormSidePanelProps {
  project: IProject | null;
  navItems: INavigationItem[];
  showSaveIndicator?: boolean;
  formStatusSection?: React.ReactNode;
  showPwFolderLink?: boolean;
  onOpenChangeHistory?: () => void;
}

const ProjectFormSidePanel: FC<IProjectFormSidePanelProps> = ({
  project,
  navItems,
  showSaveIndicator = true,
  formStatusSection,
  showPwFolderLink = true,
  onOpenChangeHistory,
}) => {
  const { t } = useTranslation();

  return (
    // This "extra" div is here so that the side-panel-container's sticky position works
    <div>
      <div className="project-form-side-panel-container" data-testid="side-panel">
        <div className="project-form-side-panel">
          <div className="side-navigation">
            <SideNavigation navItems={navItems} />
          </div>
          {onOpenChangeHistory && (
            <div className="change-history-container">
              <Button
                variant={ButtonVariant.Supplementary}
                iconStart={<IconEye />}
                onClick={onOpenChangeHistory}
                data-testid="open-project-history-button"
              >
                {t('projectForm.changeHistory.button')}
              </Button>
            </div>
          )}
          {formStatusSection && <div className="form-status-container">{formStatusSection}</div>}
          {showPwFolderLink && <PWContainer pwFolderLink={project?.pwFolderLink} />}
          {showSaveIndicator && <SaveIndicator project={project} />}
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFormSidePanel);
