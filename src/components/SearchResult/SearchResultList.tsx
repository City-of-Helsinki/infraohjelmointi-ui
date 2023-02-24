import { useAppSelector } from '@/hooks/common';
import { selectIsLoading } from '@/reducers/loadingSlice';
import useSearchResultList from '@/hooks/useSearchResultList';
import SearchResultCard from './SearchResultCard';
import SearchResultsNotFound from './SearchResultNotFound';
import SearchResultOrderDropdown from './SearchResultOrderDropdown';
import SearchResultPageDropdown from './SearchResultPageDropdown';
import SearchResultPagination from './SearchResultPagination';
import './styles.css';

const SearchResultList = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const { searchResultList } = useSearchResultList();
  const resultLength = searchResultList.length;

  return (
    <div className="search-result-list-container">
      <div className="result-list-options-container">
        <SearchResultPageDropdown resultLength={resultLength} />
        {resultLength > 0 && <SearchResultOrderDropdown />}
      </div>
      {!isLoading && resultLength > 0 ? (
        <div data-testid="search-result-list">
          {searchResultList.map((r) => (
            <SearchResultCard key={r.id} {...r} />
          ))}
          <SearchResultPagination />
        </div>
      ) : (
        <SearchResultsNotFound />
      )}
    </div>
  );
};

export default SearchResultList;
