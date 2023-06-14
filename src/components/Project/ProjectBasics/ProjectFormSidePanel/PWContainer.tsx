import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'hds-react/components/Link';

interface IPWContainerProps {
  pwFolderLink?: string | null;
}

const PWContainer: FC<IPWContainerProps> = ({ pwFolderLink }) => {
  const { t } = useTranslation();

  return (
    <div id="pw-folder-container" data-testid="pw-folder-container" className="pw-folder-container">
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
  );
};

export default PWContainer;
