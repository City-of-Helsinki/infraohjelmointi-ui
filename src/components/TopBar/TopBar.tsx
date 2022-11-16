import React, { FC } from 'react';
import { Navigation } from 'hds-react/components/Navigation';
import { useTranslation } from 'react-i18next';

/**
 * TODO: Implement actual functionality, this is just a placeholder to help style the rest of the page
 */
const TopBar: FC = () => {
  const { t } = useTranslation();
  return (
    <Navigation
      title={t('topBar.programming')}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel="Skip to content"
    >
      <Navigation.Actions>
        <Navigation.Search searchLabel={t('search')} searchPlaceholder={t('searchPage') || ''} />
        <Navigation.User label={t('login')} />
        {/* Localization will not come to the MVP version */}
        <Navigation.Item label={t('lang.fi')} />
      </Navigation.Actions>
    </Navigation>
  );
};

export default TopBar;
