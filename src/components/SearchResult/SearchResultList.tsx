import SearchResultCard from './SearchResultCard';
import SearchResultPagination from './SearchResultPagination';
import './styles.css';

const items = ['Project 1', 'Project 2', 'Project 3'];

const SearchResultList = () => {
  return (
    <div className="search-result-list-container">
      {items.map((i) => (
        <SearchResultCard key={i} title={i} />
      ))}
      <SearchResultPagination />
    </div>
  );
};

export default SearchResultList;
