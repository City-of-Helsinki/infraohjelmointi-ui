import { Button, SearchInput } from 'hds-react';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface IAdminHashtagsToolbar {
  onSetSearchWord: (value: string) => void;
}

const AdminHashtagsToolbar: FC<IAdminHashtagsToolbar> = ({ onSetSearchWord }) => {
  const { t } = useTranslation();
  return (
    <div className="admin-hashtags-toolbar">
      <Button className="add-hashtag-button">{t('addHashTag')}</Button>
      <SearchInput
        className="admin-hashtags-search"
        label={t('searchHashtag')}
        searchButtonAriaLabel={t('searchHashtag') ?? ''}
        onChange={onSetSearchWord}
        onSubmit={onSetSearchWord}
      />
    </div>
  );
};

export default memo(AdminHashtagsToolbar);
