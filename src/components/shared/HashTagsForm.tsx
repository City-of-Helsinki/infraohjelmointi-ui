import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { HookFormControlType } from '@/interfaces/formInterfaces';
import { mockTags } from '@/mocks/common';
import { silentPatchProjectCardThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo, useCallback } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';
import TagsContainer from './TagsContainer';
import Title from './Title';
import _ from 'lodash';

interface IHashTagsDialogProps {
  name: string;
  label: string;
  value: Array<string>;
  onChange: (tags: Array<string>) => void;
}
/**
 * We still don't know how this should work when editing,
 * so this doesn't have its own generic form-component yet.
 */
const HashTagsDialog: FC<IHashTagsDialogProps> = forwardRef(
  ({ name, label, value, onChange }, ref: Ref<HTMLDivElement>) => {
    const [tags, setTags] = useState<Array<string>>(value);
    const [allTags, setAllTags] = useState(mockTags);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const { Header, Content, ActionButtons } = Dialog;
    const dispatch = useAppDispatch();
    const projectId = useAppSelector(
      (state: RootState) => state.projectCard.selectedProjectCard?.id,
      _.isEqual,
    );

    // Update tags with changes in value
    useEffect(() => {
      if (value) {
        setTags(value);
      }
    }, [value]);

    useEffect(() => {
      setAllTags((currentAllTags) => currentAllTags.filter((tag) => tags.indexOf(tag) === -1));
    }, [tags]);

    const onTagDelete = useCallback((t: string) => {
      setTags((currentTags) => currentTags.filter((tag) => tag !== t));
      setAllTags((currentTags) => [...currentTags, t]);
    }, []);

    const onChangeOpen = useCallback(() => setIsOpen((currentState) => !currentState), []);

    const onEdit = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onChangeOpen();
      },
      [onChangeOpen],
    );

    const onTagClick = useCallback((tag: string) => {
      setTags((currentTags) => [...currentTags, tag]);
    }, []);

    const onSaveTags = useCallback(() => {
      dispatch(silentPatchProjectCardThunk({ data: { hashTags: tags }, id: projectId }));
      onChangeOpen();
      onChange(tags);
    }, [dispatch, onChangeOpen, projectId, tags, onChange]);

    return (
      <div className="input-wrapper" id={name} ref={ref} data-testid={name}>
        {/* Displayed in dialog */}
        <div className="display-flex-col">
          <Dialog
            id="hashtags-dialog"
            aria-labelledby={label}
            isOpen={isOpen}
            close={onChangeOpen}
            closeButtonLabelText={t('closeHashTagsWindow')}
            className="big-dialog"
          >
            <Header id={label} title={t('manageHashTags')} />
            <hr />
            <Content>
              <div className="hashtags-content-container">
                <div className="added-hashtags-title-container">
                  <Title size="xs" text={t('projectCardHashTags') || ''} />
                </div>
                <TagsContainer tags={tags} onDelete={onTagDelete} id={'project-card-hashtags'} />
              </div>
            </Content>
            <hr />
            <Content>
              <div className="hashtags-content-container">
                <div className="all-hashtags-title-container">
                  <Title size="xs" text={t('addHashTagsToProject') || ''} />
                  <button className="text-button">{t('modifyGeneralMode')}</button>
                </div>
                <div className="all-hashtags-container">
                  <Button onClick={close} variant="secondary">
                    {t('getHashTagsOrCreateNew')}
                  </Button>
                </div>
                <TagsContainer tags={allTags} onClick={onTagClick} id={'all-hashtags'} />
              </div>
            </Content>
            <ActionButtons>
              <Button onClick={onSaveTags}>{t('save')}</Button>
            </ActionButtons>
          </Dialog>

          {/* Displayed on form */}
          <div style={{ marginBottom: '0.5rem' }}>
            <FormFieldLabel text={t(`projectCardBasicsForm.${name}`)} onClick={onEdit} />
          </div>
          <TagsContainer tags={value} />
        </div>
      </div>
    );
  },
);

interface IHashTagsFormProps {
  name: string;
  label: string;
  control: HookFormControlType;
}

const HashTagsForm: FC<IHashTagsFormProps> = ({ name, label, control }) => {
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <HashTagsDialog {...field} {...fieldState} label={label} />
      )}
    />
  );
};

HashTagsDialog.displayName = 'HashTagsDialog';

export default memo(HashTagsForm);
