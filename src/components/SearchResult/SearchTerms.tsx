import useSearchTerms from '@/hooks/useSearchTerms';
import { Tag } from 'hds-react/components/Tag';
import { useTranslation } from 'react-i18next';
import './styles.css';

const SearchTerms = () => {
  const { t } = useTranslation();
  const { searchTerms, deleteTerm, deleteAllTerms } = useSearchTerms();

  return (
    <div className="search-terms-container">
      {/* existing search terms */}
      <div className="search-terms">
        {searchTerms.map((t) => (
          <Tag key={t.id} onDelete={() => deleteTerm(t)} data-testid="search-term">
            {t.value}
          </Tag>
        ))}
      </div>
      {/* delete all search terms */}
      <div>
        {searchTerms.length > 0 && (
          <Tag className="empty-all-btn" onDelete={deleteAllTerms}>
            {t('emptyTerms')}
          </Tag>
        )}
      </div>
    </div>
  );
};

export default SearchTerms;
