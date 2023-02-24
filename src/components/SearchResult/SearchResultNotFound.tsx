import { useAppSelector } from '@/hooks/common';
import useSearchTerms from '@/hooks/useSearchTerms';
import { selectIsLoading } from '@/reducers/loadingSlice';
import { useTranslation } from 'react-i18next';
import { Paragraph, Title } from '../shared';

const SearchResultsNotFound = () => {
  const { t } = useTranslation();
  const { searchTerms } = useSearchTerms();
  const isLoading = useAppSelector(selectIsLoading);
  return (
    <div className="flex-col-center" data-testid="result-not-found">
      {!isLoading && (
        <>
          <Title
            size="l"
            text={t(searchTerms.length > 0 ? 'resultsNotFoundTitle' : 'adviceSearchTitle') || ''}
          />
          <Paragraph
            size="l"
            text={searchTerms.length > 0 ? 'resultsNotFoundText' : 'adviceSearchText'}
          />
        </>
      )}
    </div>
  );
};

export default SearchResultsNotFound;
