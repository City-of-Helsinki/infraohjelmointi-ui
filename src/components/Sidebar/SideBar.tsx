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
  const projectCards = useAppSelector((state: RootState) => state.projectCard.projectCards);
  const [projectId, setProjectId] = useState('');
  const { t } = useTranslation();

  // Set the project card ID to the first in the list if found
  useEffect(() => {
    setProjectId((projectCards?.length > 0 && projectCards[0].id) || '');
  }, [projectCards]);

  const navItems: Array<INavigationItem> = [
    {
      route: `/project-card/${projectId}/basics`,
      label: t('projectCard'),
      component: <IconPenLine />,
    },
    {
      route: `planning-list`,
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
