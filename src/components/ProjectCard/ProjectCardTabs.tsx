import { Tabs, TabsCustomTheme } from 'hds-react/components/Tabs';
import { ProjectCardTasks, ProjectCardBasics } from '.';
import { useLocation, useNavigate } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { t } from 'i18next';

const ProjectCardTabs = () => {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const { TabList, Tab, TabPanel } = Tabs;

  const tabThemeOverrides: TabsCustomTheme = {
    '--tablist-border-color': 'white',
    '--tab-focus-outline-size': '1px',
  };

  const navItems: Array<INavigationItem> = [
    { route: 'basics', label: t('basicInfo'), component: <ProjectCardBasics /> },
    { route: 'tasks', label: t('tasks'), component: <ProjectCardTasks /> },
  ];

  const getActiveTab = () => navItems.findIndex((n) => path.includes(n.route));

  return (
    <div data-testid="project-card-tabs-container">
      <Tabs initiallyActiveTab={getActiveTab()} theme={tabThemeOverrides}>
        {/* tabs */}
        <TabList className="project-card-tab-list">
          {navItems.map((n) => (
            <Tab key={n.route} onClick={() => navigate(n.route)}>
              {n.label}
            </Tab>
          ))}
        </TabList>
        {/* panel (active view is rendered here) */}
        {navItems.map((n) => (
          <TabPanel key={n.route}>{n.component}</TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

export default ProjectCardTabs;
