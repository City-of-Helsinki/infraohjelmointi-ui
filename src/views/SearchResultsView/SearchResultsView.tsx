import { SearchResultsHeader, SearchResultsList } from '@/components/SearchResults';

const SearchResultsView = () => {
  return (
    <div className="bg-silver-l h-full" data-testid="search-results-view">
      <SearchResultsHeader />
      <SearchResultsList />
    </div>
  );
};

export default SearchResultsView;
