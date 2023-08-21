import { Button, SearchInput } from 'hds-react';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface IAdminHashtagsToolbar {
  onSetSearchWord: (value: string) => void;
  onToggleAddHashtagDialog: () => void;
}

const AdminHashtagsToolbar: FC<IAdminHashtagsToolbar> = ({
  onSetSearchWord,
  onToggleAddHashtagDialog,
}) => {
  const { t } = useTranslation();
  return (
    <div className="admin-hashtags-toolbar">
      <Button className="add-hashtag-button" onClick={onToggleAddHashtagDialog}>
        {t('addHashTag')}
      </Button>
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
