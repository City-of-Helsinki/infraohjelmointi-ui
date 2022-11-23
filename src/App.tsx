import { FC } from 'react';
import { Outlet } from 'react-router';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';

const App: FC = () => {
  return (
    <div>
      <Notification />
      <TopBar />
      <div className="app-content">
        <SideBar />
        <div className="width-100-p" data-testid="app-outlet">
          <Loader />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
