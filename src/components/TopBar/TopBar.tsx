import { FC, useCallback } from 'react';
import { Header, Logo, logoFi } from 'hds-react/components';
import { useTranslation } from 'react-i18next';
import { IconAngleLeft, IconSearch, IconSignin } from 'hds-react/icons';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { toggleSearch } from '@/reducers/searchSlice';
import { selectUser } from '@/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router';
import './styles.css';

const TopBar: FC = () => {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const { SkipLink, ActionBar, ActionBarItem, ActionBarSubItem, ActionBarButton } = Header;
  const MAINTENANCE_MODE: boolean = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

  const handleOpenSearch = useCallback(() => {
    if (MAINTENANCE_MODE || !user || user?.ad_groups.length === 0) {
      return; // Do nothing if disabled
    }
    dispatch(toggleSearch());
  }, [dispatch, MAINTENANCE_MODE, user]);

  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <div data-testid="top-bar" className="top-bar-container">
      {/* Back button (appears when the projects route is active) */}
      <div className="back-button-container">
        {pathname.includes('project') && (
          <button
            data-testid="top-bar-back-button"
            className="back-button"
            aria-label="navigate back"
            onClick={navigateBack}
          >
            <IconAngleLeft />
          </button>
        )}
      </div>
      {/* Navigation */}
      <div className="navigation-container">
        <Header>
          <SkipLink skipTo="#content" label={t('nav.skipToContent')} />
          <ActionBar
            title={t('topBarTitle')}
            frontPageLabel="Helsinki Infratyökalu"
            titleAriaLabel="Helsingin kaupunki"
            titleHref="https://hel.fi"
            logoAriaLabel="Service logo"
            logoHref="https://hel.fi"
            logo={<Logo src={logoFi} alt="Helsingin kaupunki" />}
            menuButtonAriaLabel="menu"
            menuButtonLabel={String(t('nav.menu'))}
            onMenuClick={(e) => e.stopPropagation()}
          >
            <ActionBarItem
              label={String(t('nav.search'))}
              icon={<IconSearch />}
              id="action-bar-search"
              onClick={handleOpenSearch}
              className="search-button"
              data-testid="search-projects"
            />
            {!user ? (
              <ActionBarButton label={String(t('nav.login'))} icon={<IconSignin />} />
            ) : (
              <ActionBarItem
                id="action-bar-user"
                label={`${user?.first_name} ${user?.last_name}`}
                avatar={`${user?.first_name?.[0]?.toUpperCase()}
            ${user?.last_name?.[0]?.toUpperCase()}`}
                fixedRightPosition
              >
                <ActionBarSubItem label={String(t('nav.notifications'))} />
              </ActionBarItem>
            )}
          </ActionBar>
        </Header>
      </div>
    </div>
  );
};

export default TopBar;
