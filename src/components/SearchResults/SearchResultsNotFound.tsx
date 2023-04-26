import { useAppSelector } from '@/hooks/common';
import useSearchTerms from '@/hooks/useSearchTerms';
import { selectIsLoading } from '@/reducers/loaderSlice';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const SearchResultsNotFound = () => {
  const { t } = useTranslation();
  const { searchTerms } = useSearchTerms();
  const isLoading = useAppSelector(selectIsLoading);

  return (
    <div className="flex flex-col items-center" data-testid="result-not-found">
      {!isLoading && (
        <>
          <h1 className="text-heading-l">
            {t(searchTerms.length > 0 ? 'resultsNotFoundTitle' : 'adviceSearchTitle')}
          </h1>
          <p className="text-l">
            {t(searchTerms.length > 0 ? 'resultsNotFoundText' : 'adviceSearchText')}
          </p>
        </>
      )}
    </div>
  );
};

export default memo(SearchResultsNotFound);
