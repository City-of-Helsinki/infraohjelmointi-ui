import { Tabs, TabsCustomTheme } from 'hds-react/components/Tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { INavigationItem } from '@/interfaces/common';
import { FC } from 'react';

interface INavigationTabProps {
  tabItems: Array<INavigationItem>;
}

/**
 * Add tabItems and the items will be rendered below this component
 */
const TabsList: FC<INavigationTabProps> = ({ tabItems }) => {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const { TabList, Tab, TabPanel } = Tabs;

  const tabThemeOverrides: TabsCustomTheme = {
    '--tablist-border-color': 'white',
    '--tab-focus-outline-size': '1px',
  };

  const getActiveTab = () => tabItems.findIndex((n) => path.includes(n.route));

  return (
    <div data-testid="tabs-list">
      <Tabs initiallyActiveTab={getActiveTab()} theme={tabThemeOverrides}>
        {/* tabs */}
        <TabList className="custom-tab-list">
          {tabItems.map((n) => (
            <Tab key={n.route} onClick={() => navigate(n.route)}>
              {n.label}
            </Tab>
          ))}
        </TabList>
        {/* panel (active view is rendered here) */}
        {tabItems.map((n) => (
          <TabPanel key={n.route}>{n.component}</TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabsList;
