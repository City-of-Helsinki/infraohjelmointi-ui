import { IListItem } from '@/interfaces/common';
import { SearchInput } from 'hds-react/components/SearchInput';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IHashTagSearchProps {
  onHashTagClick: (value: string) => void;
  hashTags: Array<IListItem>;
}

const HashTagSearch: FC<IHashTagSearchProps> = ({ onHashTagClick, hashTags }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const handleValueChange = useCallback((value: string) => setValue(value), []);

  const getSuggestions = (inputValue: string): Promise<{ value: string }[]> =>
    new Promise((resolve) => {
      const filteredItems = hashTags.filter(
        (h) => h.value.toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
      );
      resolve(filteredItems);
    });

  const handleSubmit = (value: string) => {
    value && onHashTagClick(value);
    setValue('');
  };

  return (
    <div className="dialog-section" data-testid="search-hash-tag-field-section">
      <p className="text-normal font-bold">{t('addHashTagsToProject')}</p>
      <SearchInput
        label={t('addHashTag')}
        getSuggestions={getSuggestions}
        clearButtonAriaLabel="Clear search field"
        searchButtonAriaLabel="Search"
        suggestionLabelField="value"
        value={value}
        onChange={handleValueChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default memo(HashTagSearch);
