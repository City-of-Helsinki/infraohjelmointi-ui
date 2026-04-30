import { FC, memo } from 'react';
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
}

const ProjectFormSidePanel: FC<IProjectFormSidePanelProps> = ({
  project,
  navItems,
  showSaveIndicator = true,
  formStatusSection,
  showPwFolderLink = true,
}) => {
  return (
    // This "extra" div is here so that the side-panel-container's sticky position works
    <div>
      <div className="project-form-side-panel-container" data-testid="side-panel">
        <div className="project-form-side-panel">
          <div className="side-navigation">
            <SideNavigation navItems={navItems} />
          </div>
          {formStatusSection && <div className="form-status-container">{formStatusSection}</div>}
          {showPwFolderLink && <PWContainer pwFolderLink={project?.pwFolderLink} />}
          {showSaveIndicator && <SaveIndicator project={project} />}
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFormSidePanel);
