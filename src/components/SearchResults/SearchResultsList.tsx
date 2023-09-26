import useSearchResultsList from '@/hooks/useSearchResultsList';
import SearchResultsCard from './SearchResultsCard';
import SearchResultsNotFound from './SearchResultsNotFound';
import SearchOrderDropdown from './SearchOrderDropdown';
import SearchLimitDropdown from './SearchLimitDropdown';
import SearchResultsPagination from './SearchResultsPagination';
import { memo } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectIsLoading } from '@/reducers/loaderSlice';
import './styles.css';

const SearchResultsList = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const { searchResultsList, next, previous, count } = useSearchResultsList();

  return (
    <div className="search-result-list-container">
      <div className="result-list-options-container">
        <SearchLimitDropdown resultLength={count} />
        {count > 0 && <SearchOrderDropdown />}
      </div>
      {!isLoading && count > 0 ? (
        <div data-testid="search-result-list">
          {searchResultsList.map((r) => (
            <SearchResultsCard key={r.id} {...r} />
          ))}
        </div>
      ) : (
        <SearchResultsNotFound />
      )}
      <SearchResultsPagination next={next} previous={previous} count={count} />
    </div>
  );
};

export default memo(SearchResultsList);
