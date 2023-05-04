import { useAppSelector } from '@/hooks/common';
import { INavigationItem } from '@/interfaces/common';
import { ReactComponent as IconBooks } from '@/assets/icons/books.svg';
import { ReactComponent as IconStickyNotes } from '@/assets/icons/sticky-notes.svg';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { selectProject } from '@/reducers/projectSlice';
import './styles.css';

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
      component: <IconBooks style={iconStyles} />,
      disabled: !project?.id,
    },
    {
      route: `planning`,
      label: t('planning'),
      component: <IconStickyNotes style={iconStyles} />,
      disabled: false,
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
