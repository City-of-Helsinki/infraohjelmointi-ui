import { useAppDispatch, useAppSelector } from '@/hooks/common';
import {
  getSearchResultsThunk,
  selectLastSearchParams,
  selectSearchLimit,
  selectSearchOrder,
} from '@/reducers/searchSlice';
import { Pagination } from 'hds-react/components/Pagination';
import { FC, useCallback, useMemo, MouseEvent, useEffect, useState, memo } from 'react';
import './styles.css';

interface ISearchResultsPagination {
  next: string | null;
  previous: string | null;
  count: number;
}

enum ButtonText {
  'next' = 'Seuraava',
  'previous' = 'Edellinen',
}

const SearchResultsPagination: FC<ISearchResultsPagination> = ({ next, previous, count }) => {
  const dispatch = useAppDispatch();
  const [searchPage, setSearchPage] = useState(1);
  const searchLimit = useAppSelector(selectSearchLimit);
  const lastSearchParams = useAppSelector(selectLastSearchParams);
  const searchOrder = useAppSelector(selectSearchOrder);

  const pageCount = useMemo(
    () => Math.floor(count / parseInt(searchLimit)) + 1,
    [count, searchLimit],
  );

  const handlePageChange = useCallback((value: number) => {
    setSearchPage(value);
  }, []);

  // Reset pagination every time a new search is done or the order is changed
  useEffect(() => {
    handlePageChange(1);
  }, [pageCount, searchOrder]);

  const handleGetSearchResults = useCallback(
    (event: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const buttonText = event.currentTarget.innerText;
      // Call next url
      if (buttonText === ButtonText.next && next) {
        return dispatch(getSearchResultsThunk({ fullPath: next })).then(() =>
          handlePageChange(searchPage + 1),
        );
      }
      // Call previous url
      if (buttonText === ButtonText.previous && previous) {
        return dispatch(getSearchResultsThunk({ fullPath: previous })).then(() =>
          handlePageChange(searchPage === 0 ? 0 : searchPage - 1),
        );
      }
      // Call by number clicked
      if (buttonText) {
        const buttonNumber = parseInt(buttonText);
        handlePageChange(buttonNumber);
        return dispatch(
          getSearchResultsThunk({ params: `${lastSearchParams}&page=${buttonNumber}` }),
        );
      }
    },
    [next, previous, dispatch, handlePageChange, searchPage, lastSearchParams],
  );

  return (
    <div
      className="pt-16 pb-4"
      id="custom-pagination"
      data-testid="search-results-pagination-container"
    >
      {pageCount > 1 && (
        <Pagination
          dataTestId="search-results-pagination"
          language="fi"
          onChange={handleGetSearchResults}
          pageCount={pageCount}
          pageHref={() => '#'}
          pageIndex={searchPage - 1}
          paginationAriaLabel="Search result pagination"
          siblingCount={2}
        />
      )}
    </div>
  );
};

export default memo(SearchResultsPagination);
