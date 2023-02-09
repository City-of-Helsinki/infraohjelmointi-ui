import { FC, useCallback } from 'react';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { IconBell, IconSearch } from 'hds-react/icons';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { toggleSearch } from '@/reducers/searchSlice';
import { Button } from 'hds-react/components/Button';

const TopBar: FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { t } = useTranslation();
  const { Dropdown, Actions, User, Item } = Navigation;

  const dispatch = useAppDispatch();
  const handleOpenSearch = useCallback(() => dispatch(toggleSearch()), [dispatch]);

  return (
    <div data-testid="top-bar" className="top-bar">
      <Navigation
        title={t('enums.programming')}
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
            style={{ color: 'var(--color-black-80)', fontWeight: '300', padding: '0' }}
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
