import { FC, useCallback } from 'react';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { IconBell, IconSearch } from 'hds-react/icons';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { toggleSearch } from '@/reducers/searchSlice';
import { Button } from 'hds-react/components/Button';
import { selectUser } from '@/reducers/authSlice';
import './styles.css';

const TopBar: FC = () => {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();
  const { Dropdown, Actions, User, Item } = Navigation;

  const dispatch = useAppDispatch();
  const handleOpenSearch = useCallback(() => dispatch(toggleSearch()), [dispatch]);

  return (
    <div data-testid="top-bar" className="top-bar">
      <Navigation
        title={t('option.programming')}
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
            userName={`${user?.firstName} ${user?.lastName}`}
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
  );
};

export default TopBar;
