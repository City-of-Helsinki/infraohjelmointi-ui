import { memo } from 'react';
import { adminFunctions } from '@/interfaces/adminInterfaces';
import AdminCard from '../AdminCard';
import './styles.css';

const AdminFunctions = () => {
  return (
    <div className="admin-functions">
      {adminFunctions.map((af) => (
        <AdminCard key={af} type={af} />
      ))}
    </div>
  );
};

export default memo(AdminFunctions);
