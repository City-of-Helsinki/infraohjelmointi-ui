import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { HookFormControlType } from '@/interfaces/formInterfaces';
import { mockTags } from '@/mocks/common';
import { silentPatchProjectThunk } from '@/reducers/projectSlice';
import { RootState } from '@/store';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo, useCallback } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from '../../shared/FormFieldLabel';
import HashTagsContainer from './HashTagsContainer';
import _ from 'lodash';
import Paragraph from '../../shared/Paragraph';
import './styles.css';
import NewHashTagsForm from './NewHashTagsForm';
import ExistingHashTagsForm from './ExistingHashTagsForm';

interface IProjectHashTagsDialogProps {
  name: string;
  label: string;
  value: Array<string>;
  onChange: (tags: Array<string>) => void;
}
/**
 * We still don't know how this should work when editing,
 * so this doesn't have its own generic form-component yet.
 */
const ProjectHashTagsDialog: FC<IProjectHashTagsDialogProps> = forwardRef(
  ({ name, label, value, onChange }, ref: Ref<HTMLDivElement>) => {
    const [tags, setTags] = useState<Array<string>>(value);
    const [allTags, setAllTags] = useState(mockTags);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const { Header, Content, ActionButtons } = Dialog;
    const dispatch = useAppDispatch();
    const projectId = useAppSelector(
      (state: RootState) => state.project.selectedProject?.id,
      _.isEqual,
    );
    const projectName = useAppSelector(
      (state: RootState) => state.project.selectedProject?.name,
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
      dispatch(silentPatchProjectThunk({ data: { hashTags: tags }, id: projectId }));
      onChangeOpen();
      onChange(tags);
    }, [dispatch, onChangeOpen, projectId, tags, onChange]);

    return (
      <div className="input-wrapper" id={name} ref={ref} data-testid={name}>
        {/* Dialog */}
        <div className="display-flex-col">
          <Dialog
            id="hashtags-dialog"
            aria-labelledby={label}
            isOpen={isOpen}
            close={onChangeOpen}
            closeButtonLabelText={t('closeHashTagsWindow')}
            className="big-dialog"
          >
            {/* Header */}
            <Header id={label} title={`${projectName} - ${t('manageHashTags')}`} />
            <hr />
            {/* Section 1 (Added hashtags )*/}
            <Content>
              <div className="content-container">
                <Paragraph fontWeight="bold" text={t('projectHashTags') || ''} />
                <HashTagsContainer tags={tags} onDelete={onTagDelete} id={'project-hashtags'} />
              </div>
            </Content>
            <hr />
            {/* Section 2 (Popular hashtags & Existing hashtags & Add new hashtags) */}
            <Content>
              <div className="content-container">
                <div className="dialog-section">
                  <Paragraph fontWeight="bold" text={t('popularHashTags') || ''} />
                  <HashTagsContainer tags={allTags} onClick={onTagClick} id={'popular-hashtags'} />
                </div>
                <ExistingHashTagsForm />
                <NewHashTagsForm />
              </div>
            </Content>
            <hr />
            {/* Footer (Save button) */}
            <ActionButtons>
              <div className="dialog-footer">
                <Button onClick={onSaveTags}>{t('save')}</Button>
              </div>
            </ActionButtons>
          </Dialog>

          {/* Displayed on form (Open dialog button) */}
          <div className="hashtags-label">
            <FormFieldLabel text={t(`projectBasicsForm.${name}`)} onClick={onEdit} />
          </div>
          {/* Displayed on form (Project hashtags) */}
          <HashTagsContainer tags={value} />
        </div>
      </div>
    );
  },
);

interface IProjectHashTagsProps {
  name: string;
  label: string;
  control: HookFormControlType;
}

const ProjectHashTags: FC<IProjectHashTagsProps> = ({ name, label, control }) => {
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <ProjectHashTagsDialog {...field} {...fieldState} label={label} />
      )}
    />
  );
};

ProjectHashTagsDialog.displayName = 'ProjectHashTagsDialog';

export default memo(ProjectHashTags);
