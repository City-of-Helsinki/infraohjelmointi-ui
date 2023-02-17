import { useTranslation } from 'react-i18next';
import { Paragraph, Title } from '../shared';

const SearchResultsNotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-col-center">
      <Title size="l" text={t('searchResultsNotFoundTitle') || ''} />
      <Paragraph size="l" text={t('searchResultsNotFoundText')} />
    </div>
  );
};

export default SearchResultsNotFound;
