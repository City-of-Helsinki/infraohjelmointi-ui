import { useAppSelector } from '@/hooks/common';
import { INavigationItem } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { selectProject } from '@/reducers/projectSlice';
import './styles.css';
import {
  IconBagCogwheel,
  IconBinoculars,
  IconCogwheel,
  IconGraphColumns,
  IconHistory,
  IconLocation,
  IconScrollCogwheel,
} from 'hds-react';

/**
 * Custom Sidebar, since the HDS sidebar wasn't suited for our needs
 **/
const SideBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const project = useAppSelector(selectProject);

  const { t } = useTranslation();

  const iconStyles = { height: '1.5rem', width: '1.5rem' };

  const navItems: Array<INavigationItem> = [
    {
      route: `/project/${project?.id}/basics`,
      label: t('project'),
      component: <IconBinoculars style={iconStyles} />,
      disabled: !project?.id,
    },
    {
      route: `planning`,
      label: t('planning'),
      component: <IconScrollCogwheel style={iconStyles} />,
      disabled: false,
    },
    {
      route: `placeholder 1`,
      label: 'placeholder 1',
      component: <IconLocation style={iconStyles} />,
      disabled: true,
    },
    {
      route: `placeholder 2`,
      label: 'placeholder 2',
      component: <IconBagCogwheel style={iconStyles} />,
      disabled: true,
    },
    {
      route: `placeholder 3`,
      label: 'placeholder 3',
      component: <IconGraphColumns style={iconStyles} />,
      disabled: true,
    },
    {
      route: `placeholder 4`,
      label: 'placeholder 4',
      component: <IconHistory style={iconStyles} />,
      disabled: true,
    },
    {
      route: `placeholder 5`,
      label: 'placeholder 5',
      component: <IconCogwheel style={iconStyles} />,
      disabled: true,
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
          disabled={n.disabled}
        >
          {n.component}
        </button>
      ))}
    </div>
  );
};

export default SideBar;
