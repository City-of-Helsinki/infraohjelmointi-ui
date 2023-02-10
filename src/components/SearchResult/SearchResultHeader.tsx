import { Title } from '@/components/shared';
import SearchTerms from './SearchTerms';
import SearchFilter from './SearchFilter';
import './styles.css';

const SearchResultHeader = () => {
  return (
    <div className="search-result-header-container">
      <div className="search-result-page-title">
        <Title size="l" text="Hakutulokset" />
      </div>
      <div className="search-result-terms-and-filters-container">
        <SearchTerms />
        <SearchFilter />
      </div>
    </div>
  );
};

export default SearchResultHeader;
