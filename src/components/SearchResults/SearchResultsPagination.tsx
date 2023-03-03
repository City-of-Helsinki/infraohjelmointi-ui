import { Pagination } from 'hds-react/components/Pagination';
import { useState } from 'react';
import './styles.css';

const SearchResultsPagination = () => {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <div className="pt-16 pb-4" id="custom-pagination">
      <Pagination
        language="fi"
        onChange={(event, index) => {
          event.preventDefault();
          setPageIndex(index);
        }}
        pageCount={9}
        pageHref={() => '#'}
        pageIndex={pageIndex}
        paginationAriaLabel="Pagination 1"
        siblingCount={9}
      />
    </div>
  );
};

export default SearchResultsPagination;
