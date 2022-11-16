import React, { FC } from 'react';
import { Outlet } from 'react-router';
import { Title } from '@/components/shared';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';

const App: FC = () => {
  const unused = 'unused';
  return (
    <div>
      <SideBar />
      <TopBar />
      <div className="app-content">
        <Title size="xxl" text="appTitle" />
        <Outlet />
      </div>
    </div>
  );
};

export default App;
