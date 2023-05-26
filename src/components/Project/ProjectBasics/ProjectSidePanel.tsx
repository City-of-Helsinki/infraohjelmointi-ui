import { FC } from 'react';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { IconSaveDiskette } from 'hds-react/icons';
import { SideNavigation } from '../../shared';
import { useAppSelector } from '@/hooks/common';
import { useTranslation } from 'react-i18next';
import { selectUpdated } from '@/reducers/projectSlice';
import './styles.css';
import { Link } from 'hds-react/components/Link';

interface IProjectSidePanelProps {
  pwFolderLink?: string | null;
}

const ProjectSidePanel: FC<IProjectSidePanelProps> = ({ pwFolderLink }) => {
  const updated = useAppSelector(selectUpdated);
  const { t } = useTranslation();
  const navItems = [
    { route: '#basics', label: t('nav.basics') },
    { route: '#status', label: t('nav.status') },
    { route: '#schedule', label: t('nav.schedule') },
    { route: '#financial', label: t('nav.financial') },
    { route: '#responsiblePersons', label: t('nav.responsiblePersons') },
    { route: '#location', label: t('nav.location') },
    { route: '#projectProgram', label: t('nav.projectProgram') },
  ];

  return (
    <div className="project-side-panel">
      <div className="flex max-w-[17.5rem] justify-center">
        <SideNavigation navItems={navItems} />
      </div>

      {updated && (
        <div className="mt-4 flex justify-center">
          <div className="side-nav">
            <StatusLabel className="save-icon" type="success" iconLeft={<IconSaveDiskette />}>
              {t('savedTime', { time: updated })}
            </StatusLabel>
          </div>
        </div>
      )}
      <div
        id="pw-folder-container"
        data-testid="pw-folder-container"
        className="mt-8 flex justify-center"
      >
        <div className="side-nav">
          <div className="text-heading-s" id="pw-folder-title">
            {t(`nav.documents`)}
          </div>
          <div
            id="pw-folder-link-container"
            data-testid="pw-folder-link-container"
            className="pw-folder-link-container"
          >
            <div>
              <div className="m-1 font-bold">ProjectWise</div>
              <div className="m-1">{t(`pwFolderLinkDescription`)}</div>

              {pwFolderLink ? (
                <div>
                  <Link
                    href={pwFolderLink}
                    size="S"
                    id="pw-folder-link"
                    className="pw-folder-link"
                    data-testid="pw-folder-link"
                    external
                    openInNewTab
                    openInExternalDomainAriaLabel={t(`opensExternalWebsite`) || ''}
                    openInNewTabAriaLabel={t(`opensInNewTab`) || ''}
                  >
                    {t(`nav.pwFolderLink`)}
                  </Link>
                </div>
              ) : (
                <div
                  className="pw-folder-link-not-exist"
                  data-testid="pw-folder-link-not-exist-message"
                >
                  {t(`pwFolderLinkNotExist`)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSidePanel;
