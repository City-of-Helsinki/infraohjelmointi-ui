import { useAppSelector } from '@/hooks/common';
import { INavigationItem } from '@/interfaces/common';
import { RootState } from '@/store';
import { IconPenLine, IconTicket } from 'hds-react/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import './styles.css';

/**
 * Custom Sidebar, since the HDS sidebar wasn't suited for our needs
 **/
const SideBar = () => {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const projects = useAppSelector((state: RootState) => state.project.projects);
  const [projectId, setProjectId] = useState('');
  const { t } = useTranslation();

  // Set the project ID to the first in the list if found
  useEffect(() => {
    setProjectId((projects?.length > 0 && projects[0].id) || '');
  }, [projects]);

  const navItems: Array<INavigationItem> = [
    {
      route: `/project/${projectId}/basics`,
      label: t('project'),
      component: <IconPenLine />,
    },
    {
      route: `planning-list/programmer`,
      label: t('planningList'),
      component: <IconTicket />,
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
        >
          {n.component}
        </button>
      ))}
    </div>
  );
};

export default SideBar;
