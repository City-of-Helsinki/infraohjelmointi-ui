import SearchTerms from './SearchTerms';
import './styles.css';
import { Button, ButtonSize, ButtonVariant } from 'hds-react/components/Button';
import { IconSliders } from 'hds-react/icons';
import { useAppDispatch } from '@/hooks/common';
import { memo, useCallback, useMemo } from 'react';
import { toggleSearch } from '@/reducers/searchSlice';
import { useTranslation } from 'react-i18next';

const SearchResultsHeader = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleOpenSearch = useCallback(() => dispatch(toggleSearch()), [dispatch]);
  const iconSliders = useMemo(() => <IconSliders />, []);

  return (
    <div className="search-result-header-container">
      <div className="search-result-page-title">
        <h1 className="text-heading-l">{t('searchResults')}</h1>
      </div>
      <div className="search-result-terms-and-filters-container">
        <SearchTerms />
        <div className="search-filter-container">
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="h-12 w-40"
            data-testid="filterSearchBtn"
            iconStart={iconSliders}
            onClick={handleOpenSearch}
          >
            {t('filterSearch')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(SearchResultsHeader);
