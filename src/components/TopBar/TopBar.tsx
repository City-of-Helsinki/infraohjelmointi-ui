import { FC } from 'react';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';
import { IconBell } from 'hds-react/icons';
import { useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';

const TopBar: FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { t } = useTranslation();
  const { Dropdown, Actions, Search, User, Item } = Navigation;

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
          <Search searchLabel={t('nav.search')} searchPlaceholder={t('nav.searchPage') || ''} />
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
