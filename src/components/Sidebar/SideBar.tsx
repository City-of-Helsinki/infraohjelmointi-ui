import { useAppSelector } from '@/hooks/common';
import { INavigationItem } from '@/interfaces/common';
import { RootState } from '@/store';
import { ReactComponent as IconBooks } from '@/assets/icons/books.svg';
import { ReactComponent as IconStickyNotes } from '@/assets/icons/sticky-notes.svg';
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

  const iconStyles = { height: '1.5rem', width: '1.5rem' };
  useEffect(() => {
    setProjectId((projects?.length > 0 && projects[0].id) || '');
  }, [projects]);

  const navItems: Array<INavigationItem> = [
    {
      route: `/project/${projectId}/basics`,
      label: t('projectCard'),
      component: <IconBooks style={iconStyles} />,
    },
    {
      route: `planning-list/planner`,
      label: t('planningList'),
      component: <IconStickyNotes style={iconStyles} />,
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
