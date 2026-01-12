import { INavigationItem } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import './styles.css';
import { IconBinoculars, IconCogwheel, IconGraphColumns, IconScrollCogwheel } from 'hds-react';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { isUserAdmin, isUserOnlyViewer } from '@/utils/userRoleHelpers';

/**
 * Custom Sidebar, since the HDS sidebar wasn't suited for our needs
 **/
const SideBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAppSelector(selectUser);

  const { t } = useTranslation();

  const iconStyles = { height: '1.5rem', width: '1.5rem' };

  const MAINTENANCE_MODE: boolean = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

  const navItems: Array<INavigationItem> = [
    {
      route: 'coordination',
      label: t('coordination'),
      component: <IconBinoculars style={iconStyles} />,
      disabled: MAINTENANCE_MODE || isUserOnlyViewer(user) || user?.ad_groups.length === 0,
    },
    {
      route: 'planning',
      label: t('planning'),
      component: <IconScrollCogwheel style={iconStyles} />,
      disabled: MAINTENANCE_MODE || user?.ad_groups.length === 0,
    },
    {
      route: 'reports',
      label: t('reports'),
      component: <IconGraphColumns style={iconStyles} />,
      disabled: MAINTENANCE_MODE || isUserOnlyViewer(user) || user?.ad_groups.length === 0,
    },
    {
      route: 'admin/functions',
      label: t('admin'),
      component: <IconCogwheel style={iconStyles} />,
      disabled: MAINTENANCE_MODE || !isUserAdmin(user),
    },
  ];

  return (
    <div className="sidebar" data-testid="sidebar">
      {navItems.map((n) => (
        <button
          className={`sidebar-button ${pathname.includes(n.route) ? 'selected' : ''} ${
            n.disabled ? 'disabled' : ''
          }`}
          onClick={() => navigate(n.route)}
          aria-label={n.label}
          key={n.route}
          disabled={!user || n.disabled}
        >
          {n.component}
        </button>
      ))}
    </div>
  );
};

export default SideBar;
