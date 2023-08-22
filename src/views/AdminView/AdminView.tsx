import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { useMemo } from 'react';
import './styles.css';

const AdminView = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);

  const pathname = useLocation().pathname;

  /** Parse end of pathname from url to create the page title */
  const pageTitle = useMemo(() => {
    if (!pathname?.includes('admin')) {
      return;
    }

    const type = pathname.split('/admin/')[1];

    if (type === 'functions') {
      return t('helloUser', { firstName: user?.firstName });
    } else {
      return t(`adminFunctions.${type}.name`);
    }
  }, [pathname, t, user?.firstName]);

  return (
    <div className="admin-view">
      <h1 className="admin-view-title" data-testid="admin-view-title">
        {pageTitle}
      </h1>
      <Outlet />
    </div>
  );
};

export default AdminView;