import { FC, useEffect } from 'react';
import { Outlet } from 'react-router';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/Sidebar';
import Notification from '@/components/Notification';
import Loader from '@/components/Loader';
import { useAppDispatch } from '@/hooks/common';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';

const App: FC = () => {
  const dispatch = useAppDispatch();

  // Get all project cards
  useEffect(() => {
    dispatch(getProjectCardsThunk(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
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
  );
};

export default App;
