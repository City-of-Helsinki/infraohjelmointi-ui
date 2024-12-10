import { Pagination } from 'hds-react';
import { FC, MouseEvent } from 'react';

interface IAdminHashtagsPaginationProps {
  pageCount: number;
  page: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, page: number) => void;
}

const pageHref = () => '#';
const AdminHashtagsPagination: FC<IAdminHashtagsPaginationProps> = ({
  pageCount,
  page,
  onPageChange,
}) => {
  return (
    <div className="custom-pagination mt-16" data-testid="hds-pagination">
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
