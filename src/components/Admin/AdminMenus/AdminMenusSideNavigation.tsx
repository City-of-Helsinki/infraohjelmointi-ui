import { SideNavigation } from 'hds-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { IADMIN_MENUS_MENU_TYPE } from './AdminMenus.types';

const AdminMenusSideNavigation = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);

  const setActivePage = (event: React.SyntheticEvent<HTMLElement>) => {
    setActive(event.currentTarget.getAttribute('href'));
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        <SideNavigation
          defaultOpenMainLevels={[]}
          id="admin-menus-side-navigation"
          toggleButtonLabel={t('adminFunctions.menus.sideNavigationToggleButton')}
          className="admin-menus-side-nav"
        >
          {IADMIN_MENUS_MENU_TYPE.map((menuType) => {
            return (
              <SideNavigation.MainLevel
                href={`#admin-menus-card-${menuType}`}
                active={active === `#admin-menus-card-${menuType}`}
                id={`${menuType}-navItem`}
                label={t(`adminFunctions.menus.menuType.${menuType}.name`)}
                onClick={setActivePage}
                key={menuType}
              />
            );
          })}
        </SideNavigation>
      </div>
    </div>
  );
};

export default memo(AdminMenusSideNavigation);
