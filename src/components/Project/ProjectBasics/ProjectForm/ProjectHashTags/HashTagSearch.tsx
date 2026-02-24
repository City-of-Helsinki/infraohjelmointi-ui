import { IListItem, IOption } from '@/interfaces/common';
import { defaultFilter } from 'hds-react';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'hds-react';

interface IHashTagSearchProps {
  onHashTagClick: (value: string) => void;
  availableHashTags: Array<IListItem>;
  hashTagsForSubmit: Array<IListItem>;
}

const HashTagSearch: FC<IHashTagSearchProps> = ({
  onHashTagClick,
  availableHashTags,
  hashTagsForSubmit,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    // Update selectedValues on first render and if hashTagsForSubmit change onDelete
    const selectedValues = hashTagsForSubmit.map((tag) => tag.value);
    setValue(selectedValues);
  }, [hashTagsForSubmit]);

  const hashTagsAsOptions = availableHashTags.map((tag) => ({
    value: tag.value,
    label: tag.value,
  }));

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
        style={{ maxWidth: '100%' }}
        options={hashTagsAsOptions}
        filter={defaultFilter}
        value={value || []}
        onChange={(selectedOptions, clickedOption) =>
          handleValueChange(selectedOptions, clickedOption)
        }
        texts={{
          clearButtonAriaLabel_multiple: t('projectForm.clearHashTagSelection'),
          tagRemoveSelectionAriaLabel: `${t('projectForm.removeHashTag')} ${value}`,
          placeholder: t('projectForm.selectHashTag'),
          label: t('addHashTag'),
          filterPlaceholder: t('projectForm.searchForHashTags'),
        }}
      />
    </div>
  );
};

export default memo(HashTagSearch);
