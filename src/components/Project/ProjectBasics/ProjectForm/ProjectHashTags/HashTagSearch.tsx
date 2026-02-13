import { IListItem, IOption } from '@/interfaces/common';
import { defaultFilter } from 'hds-react';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'hds-react';

interface IHashTagSearchProps {
  onHashTagClick: (value: string) => void;
  hashTags: Array<IListItem>;
}

const HashTagSearch: FC<IHashTagSearchProps> = ({ onHashTagClick, hashTags }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string[]>([]);

  const getHashTagsAsSelectOptions = (hashTags: IListItem[]): IOption[] => {
    return hashTags.map((h) => ({ value: h.value, label: h.value }));
  };

  const hashTagsAsOptions = getHashTagsAsSelectOptions(hashTags);

  const handleValueChange = useCallback(
    (selectedOptions: IOption[], clickedOption: IOption) => {
      onHashTagClick(clickedOption.value);
      const values = selectedOptions.map((option) => option.value);
      setValue(values);
    },
    [onHashTagClick],
  );

  return (
    <div className="dialog-section" data-testid="search-hash-tag-field-section">
      <p className="text-normal font-bold">{t('addHashTagsToProject')}</p>
      <Select
        noTags
        multiSelect
        required={true}
        style={{ maxWidth: '100%' }}
        options={hashTagsAsOptions}
        filter={defaultFilter}
        value={value || []}
        onChange={(selectedOptions, clickedOption) =>
          handleValueChange(selectedOptions, clickedOption)
        }
        texts={{
          clearButtonAriaLabel_multiple: 'Clear all selections',
          tagRemoveSelectionAriaLabel: `Remove ${value}`,
          placeholder: t('projectForm.selectHashTag'),
          label: t('addHashTag'),
          filterPlaceholder: t('projectForm.searchForHashTags'),
        }}
      />
    </div>
  );
};

export default memo(HashTagSearch);
