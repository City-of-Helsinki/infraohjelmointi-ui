import { INavigationItem } from '@/interfaces/common';
import { IconPenLine } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import './styles.css';

/**
 * Custom Sidebar, since the HDS sidebar wasn't suited for our needs
 **/
const SideBar = () => {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const { t } = useTranslation();

  const projectId = '050ea5d5-4a12-49d1-97b3-4d5be3d944eb';

  const navItems: Array<INavigationItem> = [
    {
      route: `project-card/${projectId}`,
      label: t('projectCard'),
      component: <IconPenLine />,
    },
  ];

  return (
    <div className="sidebar-container" data-testid="sidebar">
      {navItems.map((n) => (
        <button
          className={`sidebar-button ${path.includes(n.route) ? 'selected' : ''}`}
          onClick={() => navigate(n.route)}
          aria-label={n.label}
          key={n.route}
          data-testid="button-testing"
        >
          {n.component}
        </button>
      ))}
    </div>
  );
};

export default SideBar;
