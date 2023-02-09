import { Paragraph, Span, TextField } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import useHashTagsForm from '@/forms/useHashTagsForm';
import { IListItem } from '@/interfaces/common';
import { IHashTagsForm } from '@/interfaces/formInterfaces';
import { getHashTagsThunk } from '@/reducers/hashTagsSlice';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { postHashTag } from '@/services/hashTagsService';
import { RootState } from '@/store';
import { Button } from 'hds-react/components/Button';
import { IconCheck, IconPlus } from 'hds-react/icons';
import _ from 'lodash';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const NewHashTagsForm = () => {
  // Only show this section for admins (hardcoded to true for now)
  const isAdmin = true;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { formMethods, formValues } = useHashTagsForm();
  const { control, reset, handleSubmit } = formMethods;
  const [createNewMode, setCreateNewMode] = useState(false);
  const [responseHashTag, setResponseHashTag] = useState<IListItem | null>(null);
  const projectId = useAppSelector(
    (state: RootState) => state.project.selectedProject?.id,
    _.isEqual,
  );
  const projectHashTags =
    useAppSelector((state: RootState) => state.project.selectedProject?.hashTags, _.isEqual) || [];

  const handleCreateNewMode = useCallback(() => {
    setCreateNewMode((current) => !current);
    responseHashTag && setResponseHashTag(null);
  }, [responseHashTag]);

  const submitNewHashTag = async (form: IHashTagsForm) => {
    postHashTag({ value: form.hashTag })
      .then((res) => {
        // GET all hashTags to get redux up-to-date with the backend
        dispatch(getHashTagsThunk());
        setResponseHashTag(res);
        reset(formValues);
      })
      .catch((e) => {
        console.log('Error posting hashtag: ', e);
      });
  };

  const addToProject = () => {
    if (responseHashTag && projectId) {
      dispatch(
        silentPatchProjectThunk({
          id: projectId,
          data: { hashTags: [...projectHashTags, responseHashTag.id] },
        }),
      ).then(() => setResponseHashTag(null));
    }
  };

  return isAdmin ? (
    <div className="dialog-section">
      <Paragraph fontWeight="bold" text={t('cantFindHashTag')} />
      <div className="new-hashtags-form">
        <div data-testid="create-new-hash-tag-button">
          <Button variant="secondary" iconLeft={<IconPlus />} onClick={handleCreateNewMode}>
            {t('createNewHashTag')}
          </Button>
        </div>
        {createNewMode &&
          // If a hashtag is successfully created and edit mode it true,
          // allow admin to add it straight to the project
          (responseHashTag?.value ? (
            <div className="new-hashtags-input hashtag-created">
              <div className="hashtag-created-text">
                <IconCheck color={'var(--color-success)'} />
                <Span text={t('hashTagCreated', { responseHashTag: responseHashTag.value })} />
              </div>
              <div className="hashtag-created-text">
                <button onClick={addToProject} data-testid="add-new-hash-tag-to-project">
                  {t('addToProject')}
                </button>
              </div>
            </div>
          ) : (
            // If a hashtag isn't created and edit mode is true
            <div className="new-hashtags-input">
              <TextField control={control} name="hashTag" label={t('createNewHashTag')} />
              <div data-testid="create-hash-tag-button">
                <Button onClick={handleSubmit(submitNewHashTag)}>{t('createHashTag')}</Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  ) : null;
};

export default memo(NewHashTagsForm);
