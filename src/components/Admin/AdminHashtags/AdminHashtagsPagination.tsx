import { Pagination } from 'hds-react';
import { FC, MouseEvent, useCallback } from 'react';

interface IAdminHashtagsPaginationProps {
  pageCount: number;
  page: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, page: number) => void;
}

const AdminHashtagsPagination: FC<IAdminHashtagsPaginationProps> = ({
  pageCount,
  page,
  onPageChange,
}) => {
  const pageHref = useCallback(() => '#', []);

  return (
    <div className="custom-pagination mt-16">
      <Pagination
        language="fi"
        onChange={onPageChange}
        pageCount={pageCount}
        pageHref={pageHref}
        pageIndex={page}
        paginationAriaLabel="Pagination 1"
        siblingCount={9}
      />
    </div>
  );
};

export default AdminHashtagsPagination;
