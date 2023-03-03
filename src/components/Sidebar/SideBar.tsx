import { useAppSelector } from '@/hooks/common';
import { INavigationItem } from '@/interfaces/common';
import { ReactComponent as IconBooks } from '@/assets/icons/books.svg';
import { ReactComponent as IconStickyNotes } from '@/assets/icons/sticky-notes.svg';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { selectProjects } from '@/reducers/projectSlice';

/**
 * Custom Sidebar, since the HDS sidebar wasn't suited for our needs
 **/
const SideBar = () => {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const projects = useAppSelector(selectProjects);
  const [projectId, setProjectId] = useState('');
  const { t } = useTranslation();

  const iconStyles = { height: '1.5rem', width: '1.5rem' };
  useEffect(() => {
    setProjectId((projects?.length > 0 && projects[0].id) || '');
  }, [projects]);

  const navItems: Array<INavigationItem> = [
    {
      route: `/project/${projectId}/basics`,
      label: t('project'),
      component: <IconBooks style={iconStyles} />,
    },
    {
      route: `planning/planner`,
      label: t('planning'),
      component: <IconStickyNotes style={iconStyles} />,
    },
  ];

  return (
    <div
      className="sticky top-0 mr-auto flex h-screen w-12 min-w-[3rem] flex-col shadow-2xl"
      data-testid="sidebar"
    >
      {navItems.map((n) => (
        <button
          className={`mt-2 mr-auto mb-0 ml-auto cursor-pointer p-2 duration-300 
          first:mt-3 hover:rounded-md hover:bg-silver ${
            path.includes(n.route) ? 'rounded-sm bg-silver duration-300' : ''
          }`}
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
