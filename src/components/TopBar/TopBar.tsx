import { FC, useCallback } from 'react';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { IconAngleLeft, IconBell, IconSearch } from 'hds-react/icons';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { toggleSearch } from '@/reducers/searchSlice';
import { Button } from 'hds-react/components/Button';
import { selectUser } from '@/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router';
import './styles.css';

const TopBar: FC = () => {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const { Dropdown, Actions, User, Item } = Navigation;

  const handleOpenSearch = useCallback(() => dispatch(toggleSearch()), [dispatch]);

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
        <Navigation
          title={t('topBarTitle')}
          menuToggleAriaLabel="menu"
          skipTo="#content"
          skipToContentLabel={t('nav.skipToContent')}
        >
          <Actions>
            {/* search */}
            <Button
              variant="supplementary"
              iconLeft={<IconSearch />}
              onClick={handleOpenSearch}
              data-testid="search-projects"
              className="search-button"
            >
              {t('nav.search')}
            </Button>
            {/* user */}
            <User
              label={t('nav.login')}
              // temporary uuid here until we get the user's name from helsinki-profiili
              userName={`${user?.uuid}`}
              authenticated={!!user}
            >
              <Item label={'Tietoa käyttäjästä'} />
            </User>
            {/* notifications */}
            <Dropdown label={t('nav.notifications')} icon={<IconBell />}>
              <Item label={'Ilmoitus'} />
              <Item label={'Ilmoitus'} />
            </Dropdown>
          </Actions>
        </Navigation>
      </div>
    </div>
  );
};

export default TopBar;
