import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { HookFormControlType, IHashTagsForm } from '@/interfaces/formInterfaces';
import { mockTags } from '@/mocks/common';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { RootState } from '@/store';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo, useCallback } from 'react';
import { Control, Controller, FieldValues, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './FormFieldLabel';
import TagsContainer from './TagsContainer';
import Title from './Title';
import _ from 'lodash';
import { SearchInput } from 'hds-react/components/SearchInput';
import Paragraph from './Paragraph';
import { IconPlus } from 'hds-react/icons';
import TextField from './TextField';
import { TextInput } from 'hds-react/components/TextInput';

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
    const [createNewMode, setCreateNewMode] = useState(false);
    const { t } = useTranslation();
    const { Header, Content, ActionButtons } = Dialog;
    const dispatch = useAppDispatch();
    const projectId = useAppSelector(
      (state: RootState) => state.project.selectedProject?.id,
      _.isEqual,
    );

    const { control, handleSubmit, reset } = useForm<IHashTagsForm>({
      defaultValues: {
        hashTag: '',
      },
    });

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
      dispatch(silentPatchProjectThunk({ data: { hashTags: tags }, id: projectId }));
      onChangeOpen();
      onChange(tags);
    }, [dispatch, onChangeOpen, projectId, tags, onChange]);

    const handleCreateNewMode = useCallback(() => setCreateNewMode((current) => !current), []);

    const submitNewHashTag = async (form: IHashTagsForm) => {
      console.log('Submit form: ', form);
    };

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
            {/* TODO: add projet name to title */}
            <Header id={label} title={t('manageHashTags')} />
            <hr />
            <Content>
              <div className="hashtags-content-container">
                <div className="added-hashtags-title-container">
                  <Paragraph fontWeight="bold" text={t('projectHashTags') || ''} />
                </div>
                <TagsContainer tags={tags} onDelete={onTagDelete} id={'project-hashtags'} />
              </div>
            </Content>
            <hr />
            <Content>
              <div className="hashtags-content-container">
                {/* Popular hashtags */}
                <div className="hashtags-title-container">
                  <Paragraph fontWeight="bold" text={t('popularHashTags') || ''} />
                </div>
                <div style={{ marginBottom: 'var(--spacing-m)' }}>
                  <TagsContainer tags={allTags} onClick={onTagClick} id={'all-hashtags'} />
                </div>
                {/* TODO: Add existing hashtags */}
                <div className="hashtags-title-container">
                  <Title size="xs" text={'Lisää hankkeelle tunnisteita'} />
                </div>
                <div style={{ marginBottom: 'var(--spacing-m)' }}>
                  <SearchInput
                    label="Lisää tunniste"
                    onSubmit={(submittedValue) => console.log('Submitted value:', submittedValue)}
                  />
                </div>
                {/* TODO: Add new hashtags (admin) */}
                <div className="hashtags-title-container">
                  <Title size="xs" text={'Etkö löydä tunnistetta?'} />
                </div>
                <div style={{ marginBottom: 'var(--spacing-m)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      variant="secondary"
                      iconLeft={<IconPlus />}
                      onClick={handleCreateNewMode}
                      style={{ height: '3.5rem' }}
                    >
                      {'Luo uusi tunniste'}
                    </Button>
                    {createNewMode && (
                      <div style={{ display: 'flex' }}>
                        <TextField control={control} name="hashTag" label="Luo uusi tunniste" />
                        <Button
                          style={{ height: '3.5rem' }}
                          onClick={handleSubmit(submitNewHashTag)}
                        >
                          {'Luo tunniste'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Content>
            <hr />
            <ActionButtons>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  flexDirection: 'column',
                }}
              >
                <Button onClick={onSaveTags}>{t('save')}</Button>
              </div>
            </ActionButtons>
          </Dialog>

          {/* Displayed on form */}
          <div style={{ marginBottom: '0.5rem' }}>
            <FormFieldLabel text={t(`projectBasicsForm.${name}`)} onClick={onEdit} />
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
