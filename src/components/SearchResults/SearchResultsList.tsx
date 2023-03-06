import { useAppSelector } from '@/hooks/common';
import { selectIsLoading } from '@/reducers/loadingSlice';
import useSearchResultsList from '@/hooks/useSearchResultsList';
import SearchResultsCard from './SearchResultsCard';
import SearchResultsNotFound from './SearchResultsNotFound';
import SearchResultsOrderDropdown from './SearchResultsOrderDropdown';
import SearchResultsPageDropdown from './SearchResultsPageDropdown';
import SearchResultsPagination from './SearchResultsPagination';
import './styles.css';

const SearchResultsList = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const { searchResultsList, next, previous, count } = useSearchResultsList();
  const resultLength = searchResultsList.length;

  return (
    <div className="search-result-list-container">
      <div className="result-list-options-container">
        <SearchResultsPageDropdown resultLength={resultLength} />
        {resultLength > 0 && <SearchResultsOrderDropdown />}
      </div>
      {!isLoading && resultLength > 0 ? (
        <div data-testid="search-result-list">
          {searchResultsList.map((r) => (
            <SearchResultsCard key={r.id} {...r} />
          ))}
          <SearchResultsPagination next={next} previous={previous} count={count} />
        </div>
      ) : (
        <SearchResultsNotFound />
      )}
    </div>
  );
};

export default SearchResultsList;
