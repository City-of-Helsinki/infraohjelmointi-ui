import { Paragraph } from '@/components/shared';
import { SearchInput } from 'hds-react/components/SearchInput';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const ExistingHashTagsForm = () => {
  const { t } = useTranslation();
  return (
    <div className="dialog-section">
      <Paragraph fontWeight="bold" text={t('addHashTagsToProject')} />
      <SearchInput
        label={t('addHashTag')}
        onSubmit={(submittedValue) => console.log('Submitted value:', submittedValue)}
      />
    </div>
  );
};

export default memo(ExistingHashTagsForm);
