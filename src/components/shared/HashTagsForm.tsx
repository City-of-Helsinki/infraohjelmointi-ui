import { HookFormControlType } from '@/interfaces/formInterfaces';
import { mockTags } from '@/mocks/common';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';
import TagsContainer from './TagsContainer';
import Title from './Title';

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

    // Update tags with changes in value
    useEffect(() => {
      if (value) {
        setTags(value);
      }
    }, [value]);

    useEffect(() => {
      setAllTags(allTags.filter((tag) => tags.indexOf(tag) === -1));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tags]);

    const onTagDelete = (t: string) => {
      setTags(tags.filter((tag) => tag !== t));
      setAllTags([...allTags, t]);
    };

    const onEdit = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsOpen(!isOpen);
    };

    const onTagClick = (tag: string) => {
      setTags([...tags, tag]);
    };

    const onSaveTags = () => {
      onChange(tags);
      setIsOpen(!isOpen);
    };

    const onChangeOpen = () => setIsOpen(!isOpen);

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
            className="hashtags-dialog"
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
          <FormFieldLabel text={t(`projectCardBasicsForm.${name}`)} onClick={onEdit} />
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
