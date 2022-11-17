import { FC } from 'react';
import { Outlet } from 'react-router';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';

const App: FC = () => {
  return (
    <div>
      <TopBar />
      <div className="app-content">
        <SideBar />
        <div className="width-100-p">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
