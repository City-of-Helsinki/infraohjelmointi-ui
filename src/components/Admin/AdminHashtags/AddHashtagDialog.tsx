import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IError } from '@/interfaces/common';
import { postHashTagThunk, selectHashTags } from '@/reducers/hashTagsSlice';
import { notifySuccess } from '@/reducers/notificationSlice';
import { getErrorText } from '@/utils/validation';
import { Button, Dialog, TextInput } from 'hds-react';
import { ChangeEvent, FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IAddhashtagDialogProps {
  isOpen: boolean;
  onToggleAddHashtagDialog: () => void;
}

const AddHashtagDialog: FC<IAddhashtagDialogProps> = ({ isOpen, onToggleAddHashtagDialog }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Header, Content, ActionButtons } = Dialog;
  const [hashtagName, setHashtagName] = useState('');
  const titleId = 'add-hashtag-title';
  const descriptionId = 'add-hashtag-content';

  const error = useAppSelector(selectHashTags).error as IError;

  const onSetHashtagName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setHashtagName(e.target.value),
    [],
  );

  const onAddHashtag = useCallback(async () => {
    if (!hashtagName) {
      return;
    }
    try {
      const res = await dispatch(postHashTagThunk({ value: hashtagName }));
      if (!res.type.includes('rejected')) {
        setHashtagName('');
        onToggleAddHashtagDialog();
        dispatch(
          notifySuccess({
            message: 'hashtagPostSuccess',
            title: 'hashtagPostSuccess',
            type: 'toast',
            duration: 1500,
          }),
        );
      }
    } catch (e) {
      dispatch(
        notifySuccess({
          message: 'hashtagPostError',
          title: 'postError',
          type: 'toast',
          duration: 1500,
        }),
      );
    }
  }, [hashtagName, dispatch, onToggleAddHashtagDialog]);

  return (
    <>
      <Dialog
        id="add-hashtag-dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        isOpen={isOpen}
        close={onToggleAddHashtagDialog}
        closeButtonLabelText="Close add hashtag dialog"
      >
        <Header id={titleId} title={t('addHashTag')} />
        <Content>
          <TextInput
            id="hashtag-name-input"
            label={t('hashtagName')}
            value={hashtagName}
            onChange={onSetHashtagName}
            data-testid="hashtag-name-input"
            errorText={getErrorText('value', error, t)}
            invalid={getErrorText('value', error, t) !== ''}
          />
        </Content>
        <ActionButtons>
          <Button onClick={onAddHashtag} data-testid="submit-hashtag-button">
            {t('save')}
          </Button>
          <Button onClick={onToggleAddHashtagDialog} variant="secondary">
            {t('cancel')}
          </Button>
        </ActionButtons>
      </Dialog>
    </>
  );
};

export default memo(AddHashtagDialog);
