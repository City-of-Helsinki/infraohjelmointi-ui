import { SideNavigation } from 'hds-react';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.css';
import { ADMIN_MENUS_MENU_TYPE } from '@/interfaces/menuItemsInterfaces';

interface AdminMenusSideNavigationProps {
  active: string | null;
  setActivePage: (id: string) => void;
}
const AdminMenusSideNavigation: FC<AdminMenusSideNavigationProps> = ({ active, setActivePage }) => {
  const { t } = useTranslation();

  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        <SideNavigation
          defaultOpenMainLevels={[]}
          id="admin-menus-side-navigation"
          toggleButtonLabel={t('adminFunctions.menus.sideNavigationToggleButton')}
          className="admin-menus-side-nav"
        >
          {ADMIN_MENUS_MENU_TYPE.map((menuType) => {
            return (
              <SideNavigation.MainLevel
                href={`#menu-card-${menuType}`}
                active={active === `menu-card-${menuType}`}
                id={`${menuType}-navItem`}
                label={t(`adminFunctions.menus.listType.${menuType}`)}
                onClick={() => setActivePage(`menu-card-${menuType}`)}
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
