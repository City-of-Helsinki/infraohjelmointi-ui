import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getSearchResultsThunk, selectSearchPage, setSearchPage } from '@/reducers/searchSlice';
import { Pagination } from 'hds-react/components/Pagination';
import { FC, useCallback, useMemo, MouseEvent } from 'react';
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
  const searchPage = useAppSelector(selectSearchPage);

  const pageCount = useMemo(() => Math.floor(count / 10) + 1, [count]);

  const handleGetSearchResults = useCallback(
    (event: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const buttonText = event.currentTarget.innerText;
      // Call next url
      if (buttonText === ButtonText.next && next) {
        return dispatch(getSearchResultsThunk({ fullPath: next })).then(() =>
          dispatch(setSearchPage(searchPage + 1)),
        );
      }
      // Call previous url
      if (buttonText === ButtonText.previous && previous) {
        return dispatch(getSearchResultsThunk({ fullPath: previous })).then(() =>
          dispatch(setSearchPage(searchPage === 0 ? 0 : searchPage - 1)),
        );
      }
      // Call by number clicked
      if (buttonText) {
        const buttonNumber = parseInt(buttonText);
        dispatch(setSearchPage(buttonNumber));
        return dispatch(getSearchResultsThunk({}));
      }
    },
    [dispatch, next, searchPage, previous],
  );

  return (
    <div className="pt-16 pb-4" id="custom-pagination">
      {pageCount > 1 && (
        <Pagination
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

export default SearchResultsPagination;
