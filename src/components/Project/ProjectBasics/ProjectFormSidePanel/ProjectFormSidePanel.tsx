import { FC, memo } from 'react';
import { SideNavigation } from '../../../shared';
import PWContainer from './PWContainer';
import SaveIndicator from './SaveIndicator';
import { INavigationItem } from '@/interfaces/common';
import './styles.css';

interface IProjectFormSidePanelProps {
  navItems: INavigationItem[];
  pwFolderLink?: string | null;
  showSaveIndicator?: boolean;
  formStatusSection?: React.ReactNode;
}

const ProjectFormSidePanel: FC<IProjectFormSidePanelProps> = ({
  navItems,
  pwFolderLink,
  showSaveIndicator = true,
  formStatusSection,
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
          <PWContainer pwFolderLink={pwFolderLink} />
          {showSaveIndicator && <SaveIndicator />}
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFormSidePanel);
