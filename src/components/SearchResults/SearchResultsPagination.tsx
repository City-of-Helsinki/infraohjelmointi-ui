import { Pagination } from 'hds-react/components/Pagination';
import { FC, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import './styles.css';

interface ISearchResultsPagination {
  next: number | null;
  previous: number | null;
  count: number;
}

enum ButtonText {
  'next' = 'Seuraava',
  'previous' = 'Edellinen',
}
const SearchResultsPagination: FC<ISearchResultsPagination> = ({ next, previous, count }) => {
  // const { page } = useParams();
  const navigate = useNavigate();

  const pageCount = useMemo(() => Math.floor(count / 10), [count]);
  const getSearchResults = (buttonText: ButtonText) => {
    // TODO: dispatch a new get request
  };
  console.log(pageCount);

  return (
    <div className="pt-16 pb-4" id="custom-pagination">
      <Pagination
        language="fi"
        onChange={(event, index) => {
          event.preventDefault();
          const buttonText = event.currentTarget.innerText;
          if (buttonText === ButtonText.next || buttonText === ButtonText.previous) {
            // call next url
          } else {
            // number was clicked
          }
          console.log(event.currentTarget.innerText);

          // navigate(`/search-results/${index}`);
        }}
        pageCount={pageCount}
        pageHref={() => '#'} // what is this?
        pageIndex={0} // page index "needs" to be 0 ...
        paginationAriaLabel="Search result pagination"
        siblingCount={2}
      />
    </div>
  );
};

export default SearchResultsPagination;
