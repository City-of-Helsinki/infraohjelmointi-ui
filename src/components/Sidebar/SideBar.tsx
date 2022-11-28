import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { INavigationItem } from '@/interfaces/common';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { IconPenLine } from 'hds-react/icons';
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
  const dispatch = useAppDispatch();
  const projectCards = useAppSelector((state: RootState) => state.projectCard.projectCards);
  const [projectId, setProjectId] = useState('');
  const { t } = useTranslation();

  useEffect(
    function getProjectCards() {
      dispatch(getProjectCardsThunk());
    },
    [dispatch],
  );

  useEffect(
    function getProjectCardId() {
      if (projectCards && projectCards?.length > 0) {
        setProjectId((projectCards && projectCards[0].id) || '');
      }
    },
    [projectCards],
  );

  const navItems: Array<INavigationItem> = [
    {
      route: `project-card/${projectId}/`,
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
        >
          {n.component}
        </button>
      ))}
    </div>
  );
};

export default SideBar;
