import { Tag } from 'hds-react/components/Tag';
import './styles.css';

const SearchTerms = () => {
  return (
    <div className="search-terms-container">
      {/* existing search terms */}
      <div className="search-terms">
        <Tag onDelete={() => console.log('delete tag')}>Term 1</Tag>
        <Tag onDelete={() => console.log('delete tag')}>Term 2</Tag>
        <Tag onDelete={() => console.log('delete tag')}>Term 3</Tag>
        <Tag onDelete={() => console.log('delete tag')}>Term 4</Tag>
      </div>
      {/* delete all search terms */}
      <div>
        <Tag className="empty-all-btn" onDelete={() => console.log('delete all tags')}>
          Tyhjennä hakuehdot
        </Tag>
      </div>
    </div>
  );
};

export default SearchTerms;
