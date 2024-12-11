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

  const pageIndex = useMemo(() => searchPage - 1, [searchPage]);
  const pageHref = useCallback(() => '#', []);
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
    async (event: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const buttonText = event.currentTarget.textContent;

      // Call next url
      if (buttonText === ButtonText.next && next) {
        try {
          await dispatch(getSearchResultsThunk({ fullPath: next }));
          handlePageChange(searchPage + 1);
        } catch (e) {
          console.log('Error getting next search results: ', e);
        }
      }
      // Call previous url
      else if (buttonText === ButtonText.previous && previous) {
        try {
          await dispatch(getSearchResultsThunk({ fullPath: previous }));
          handlePageChange(searchPage === 0 ? 0 : searchPage - 1);
        } catch (e) {
          console.log('Error getting previous search results: ', e);
        }
      }
      // Call by number clicked
      else if (buttonText) {
        const buttonNumber = parseInt(buttonText);
        handlePageChange(buttonNumber);
        try {
          await dispatch(
            getSearchResultsThunk({ params: `${lastSearchParams}&page=${buttonNumber}` }),
          );
        } catch (e) {
          console.log(`Error getting search results for page ${buttonNumber}: `, e);
        }
      }
    },
    [next, previous, dispatch, handlePageChange, searchPage, lastSearchParams],
  );

  return (
    <div className="custom-pagination pb-4 pt-16" data-testid="search-results-pagination-container">
      {pageCount > 1 && (
        <Pagination
          data-testid="search-results-pagination"
          language="fi"
          onChange={handleGetSearchResults}
          pageCount={pageCount}
          pageHref={pageHref}
          pageIndex={pageIndex}
          paginationAriaLabel="Search result pagination"
          siblingCount={2}
        />
      )}
    </div>
  );
};

export default memo(SearchResultsPagination);
