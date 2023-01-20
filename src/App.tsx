import { FC } from 'react';
import { Outlet } from 'react-router';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { Search } from '@/components/Search';

const App: FC = () => {
  const isSearchOpen = false;

  return (
    <div>
      <Search />
      <div className={isSearchOpen ? 'app-overlay' : ''}>
        <Notification />
        <TopBar />
        <div className="app-content">
          <SideBar />
          <div className="w-100-p" data-testid="app-outlet">
            <Loader />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
