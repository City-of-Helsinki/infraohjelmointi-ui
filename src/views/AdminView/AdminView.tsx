import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { useMemo } from 'react';
import './styles.css';

const AdminView = () => {
  const { t } = useTranslation();
  const userName = useAppSelector(selectUser)?.first_name;

  const pathname = useLocation().pathname;

  /** Parse end of pathname from url to create the page title */
  const pageTitle = useMemo(() => {
    if (!pathname?.includes('admin')) {
      return;
    }

    const type = pathname.split('/admin/')[1];

    if (type === 'functions') {
      return t('helloUser', { firstName: userName });
    } else {
      return t(`adminFunctions.${type}.name`);
    }
  }, [pathname, t, userName]);

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
