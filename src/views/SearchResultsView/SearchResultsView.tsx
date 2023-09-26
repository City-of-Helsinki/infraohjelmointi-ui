import { SearchResultsHeader, SearchResultsList } from '@/components/SearchResults';

const SearchResultsView = () => {
  return (
    <div className="h-full bg-silver-l" data-testid="search-results-view">
      <SearchResultsHeader />
      <SearchResultsList />
    </div>
  );
};

export default SearchResultsView;
