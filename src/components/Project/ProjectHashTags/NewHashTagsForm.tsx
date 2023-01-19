import { Paragraph, Span, TextField } from '@/components/shared';
import useHashTagsForm from '@/hooks/useHashTagsForm';
import { IHashTagsForm } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconPlus } from 'hds-react/icons';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const NewHashTagsForm = () => {
  // Only show this section for admins (hardcoded to true for now)
  const isAdmin = true;
  const { formMethods, formValues } = useHashTagsForm();
  const { control, reset, handleSubmit } = formMethods;
  const [createNewMode, setCreateNewMode] = useState(false);
  const [responseHashTag, setResponseHashTag] = useState('');
  const { t } = useTranslation();

  const handleCreateNewMode = useCallback(() => setCreateNewMode((current) => !current), []);

  const submitNewHashTag = async (form: IHashTagsForm) => {
    console.log('Submit form: ', form);
    setResponseHashTag(form.hashTag);
    reset(formValues);
  };

  const addToProject = () => console.log('Hashtag should be added to project...');

  return isAdmin ? (
    <div className="dialog-section">
      <Paragraph fontWeight="bold" text={t('cantFindHashTag')} />
      <div className="new-hashtags-form">
        <Button variant="secondary" iconLeft={<IconPlus />} onClick={handleCreateNewMode}>
          {t('createNewHashTag')}
        </Button>
        {createNewMode &&
          // If a hashtag is successfully created and edit mode it true,
          // allow admin to add it straight to the project
          (responseHashTag ? (
            <div className="new-hashtags-input hashtag-created">
              <div className="hashtag-created-text">
                <IconCheck color={'var(--color-success)'} />
                <Span text={t('hashTagCreated', { responseHashTag })} />
              </div>
              <div className="hashtag-created-text">
                <button onClick={addToProject}>{t('addToProject')}</button>
              </div>
            </div>
          ) : (
            // If a hashtag isn't created and edit mode is true
            <div className="new-hashtags-input">
              <TextField control={control} name="hashTag" label={t('createNewHashTag')} />
              <Button onClick={handleSubmit(submitNewHashTag)}>{t('createHashTag')}</Button>
            </div>
          ))}
      </div>
    </div>
  ) : null;
};

export default memo(NewHashTagsForm);
