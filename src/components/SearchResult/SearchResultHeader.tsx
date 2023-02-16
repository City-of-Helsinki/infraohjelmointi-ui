import { Title } from '@/components/shared';
import SearchTerms from './SearchTerms';
import './styles.css';
import { Button } from 'hds-react/components/Button';
import { IconSliders } from 'hds-react/icons';
import { useAppDispatch } from '@/hooks/common';
import { useCallback } from 'react';
import { toggleSearch } from '@/reducers/searchSlice';

const SearchResultHeader = () => {
  const dispatch = useAppDispatch();
  const handleOpenSearch = useCallback(() => dispatch(toggleSearch()), [dispatch]);
  return (
    <div className="search-result-header-container">
      <div className="search-result-page-title">
        <Title size="l" text="Hakutulokset" />
      </div>
      <div className="search-result-terms-and-filters-container">
        <SearchTerms />
        <div className="search-filter-container">
          <Button
            variant="secondary"
            size="small"
            iconLeft={<IconSliders />}
            onClick={handleOpenSearch}
          >
            Rajaa hakua
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultHeader;
