import { memo } from 'react';
import AdminHashtagsToolbar from './AdminHashtagsToolbar';
import AdminHashtagsTable from './AdminHashtagsTable';

const AdminHashtags = () => {
  return (
    <>
      <AdminHashtagsToolbar />
      <AdminHashtagsTable />
    </>
  );
};

export default memo(AdminHashtags);
