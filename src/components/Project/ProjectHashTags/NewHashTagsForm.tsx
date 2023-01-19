import { Paragraph, TextField } from '@/components/shared';
import useHashTagsForm from '@/hooks/useHashTagsForm';
import { IHashTagsForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { IconPlus } from 'hds-react/icons';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const NewHashTagsForm = () => {
  // Only show this section for admins (hardcoded to true for now)
  const isAdmin = true;
  const { formMethods, formValues } = useHashTagsForm();
  const { control, reset, handleSubmit } = formMethods;
  const [createNewMode, setCreateNewMode] = useState(false);
  const { t } = useTranslation();

  const handleCreateNewMode = useCallback(() => setCreateNewMode((current) => !current), []);

  const submitNewHashTag = async (form: IHashTagsForm) => {
    console.log('Submit form: ', form);
    reset(formValues);
  };

  return isAdmin ? (
    <div className="dialog-section">
      <Paragraph fontWeight="bold" text={t('cantFindHashTag')} />
      <div className="new-hashtags-form">
        <Button variant="secondary" iconLeft={<IconPlus />} onClick={handleCreateNewMode}>
          {t('createNewHashTag')}
        </Button>
        {createNewMode && (
          <div className="new-hashtags-input">
            <TextField control={control} name="hashTag" label={t('createNewHashTag')} />
            <Button onClick={handleSubmit(submitNewHashTag)}>{t('createHashTag')}</Button>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default memo(NewHashTagsForm);
