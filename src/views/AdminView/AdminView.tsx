import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import './styles.css';

const AdminView = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);

  return (
    <div className="admin-view">
      <h1 className="text-heading-l">{t('helloUser', { firstName: user?.firstName })}</h1>
      <Outlet />
    </div>
  );
};

export default AdminView;
