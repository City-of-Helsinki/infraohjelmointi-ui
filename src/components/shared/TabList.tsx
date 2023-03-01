import { Tabs, TabsCustomTheme } from 'hds-react/components/Tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { FC } from 'react';

interface ITabListProps {
  navItems: Array<INavigationItem>;
}

/**
 * Add tabItems and the items will be rendered below this component
 */
const TabList: FC<ITabListProps> = ({ navItems }) => {
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const tabThemeOverrides: TabsCustomTheme = {
    '--tablist-border-color': 'white',
    '--tab-focus-outline-size': '0.0625rem',
  };

  const getActiveTab = () => navItems.findIndex((n) => path.includes(n.route));

  return (
    <div data-testid="tabs-list">
      <Tabs initiallyActiveTab={getActiveTab()} theme={tabThemeOverrides}>
        {/* tabs */}
        <Tabs.TabList className="border-b border-gray z-0 pl-48">
          {navItems.map((n) => (
            <Tabs.Tab key={n.route} onClick={() => navigate(n.route)}>
              {n.label}
            </Tabs.Tab>
          ))}
        </Tabs.TabList>
        {/* panel (active view is rendered here) */}
        {navItems.map((n) => (
          <Tabs.TabPanel key={n.route}>{n.component}</Tabs.TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabList;
