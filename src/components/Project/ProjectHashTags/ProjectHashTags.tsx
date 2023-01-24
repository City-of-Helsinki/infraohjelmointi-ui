import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { HookFormControlType } from '@/interfaces/formInterfaces';
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
import HashTagSearch from './HashTagSearch';
import { IListItem } from '@/interfaces/common';

export interface IHashTagsObject {
  [key: string]: { value: string; id: string };
}

interface IProjectHashTagsDialogProps {
  name: string;
  label: string;
  projectHashTags: Array<string>;
  onChange: (tags: Array<string>) => void;
}
/**
 * The hashtags endpoint returns hashTags in {value, id} format, while the hashTags for each project
 * are just an ID reference to that hashTag. The HDSSearchInput component, which is used for searching
 * all hashTags, only returns the displayed (string) value when selecting a hashTag.
 *
 */
const ProjectHashTagsDialog: FC<IProjectHashTagsDialogProps> = forwardRef(
  ({ name, label, projectHashTags, onChange }, ref: Ref<HTMLDivElement>) => {
    const { Header, Content, ActionButtons } = Dialog;
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const projectId = useAppSelector(
      (state: RootState) => state.project.selectedProject?.id,
      _.isEqual,
    );
    const projectName = useAppSelector(
      (state: RootState) => state.project.selectedProject?.name,
      _.isEqual,
    );

    // HashTags as list items
    const allHashTags = useAppSelector((state: RootState) => state.lists.hashTags, _.isEqual);
    // HashTags object to easily get the id from the search result
    const [hashTagsObject, setHashTagsObject] = useState<IHashTagsObject>({});
    // Displayed hashTag value (this value is also used when submitting with the hashTags object)
    const [hashTagValues, setHashTagValues] = useState<Array<string>>(projectHashTags);
    // HashTags for search results
    const [hashTagsForSearch, setHashTagsForSearch] = useState<Array<IListItem>>([]);
    const [popularHashTags, setPopularHashTags] = useState<Array<string>>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Create an object from the hashtags to not need to iterate when the user
    // chooses a hashtag from the search form
    useEffect(() => {
      setHashTagsObject(
        Object.fromEntries(
          allHashTags.map((h) => [
            h.value,
            {
              value: h.value,
              id: h.id,
            },
          ]),
        ),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allHashTags]);

    // Add the projectHashTags to hashTagValues
    useEffect(() => {
      if (projectHashTags && allHashTags) {
        setHashTagValues(
          allHashTags.filter(({ id }) => projectHashTags.indexOf(id) !== -1).map((v) => v.value),
        );
      }
    }, [projectHashTags, allHashTags]);

    // Remove hashTags from popularHashTags and hashTagsForSearch
    // that are already added to the project for submission
    useEffect(() => {
      setPopularHashTags((current) => current.filter((c) => hashTagValues.indexOf(c) === -1));
      setHashTagsForSearch(allHashTags.filter((c) => hashTagValues.indexOf(c.value) === -1));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allHashTags, hashTagValues]);

    const onTagDelete = useCallback((tag: string) => {
      setHashTagValues((current) => current.filter((t) => t !== tag));
    }, []);

    const handleSetOpen = useCallback(() => setIsOpen((currentState) => !currentState), []);

    const onEdit = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleSetOpen();
      },
      [handleSetOpen],
    );

    const addHashTagForSubmit = useCallback(
      (value: string) => {
        setHashTagValues((current) => [...current, hashTagsObject[value].value]);
      },
      [hashTagsObject],
    );

    // Submit hashTagValues and close the dialog
    const onSubmit = useCallback(() => {
      dispatch(
        silentPatchProjectThunk({
          data: { hashTags: hashTagValues.map((h) => hashTagsObject[h].id) },
          id: projectId,
        }),
      );
      handleSetOpen();
      onChange(hashTagValues);
    }, [dispatch, hashTagValues, projectId, handleSetOpen, onChange, hashTagsObject]);

    return (
      <div className="input-wrapper" id={name} ref={ref} data-testid={name}>
        {/* Dialog */}
        <div className="display-flex-col">
          <Dialog
            id="hashtags-dialog"
            aria-labelledby={label}
            isOpen={isOpen}
            close={handleSetOpen}
            closeButtonLabelText={t('closeHashTagsWindow')}
            className="big-dialog"
          >
            {/* Header */}
            <Header id={label} title={`${projectName} - ${t('manageHashTags')}`} />
            <hr />
            {/* Section 1 (Added hashtags ) */}
            <Content>
              <div className="content-container">
                <Paragraph fontWeight="bold" text={t('projectHashTags') || ''} />
                <HashTagsContainer
                  tags={hashTagValues}
                  onDelete={onTagDelete}
                  id={'project-hashtags'}
                />
              </div>
            </Content>
            <hr />
            {/* Section 2 (Popular hashtags & Existing hashtags & Add new hashtags) */}
            <Content>
              <div className="content-container">
                <div className="dialog-section">
                  <Paragraph fontWeight="bold" text={t('popularHashTags') || ''} />
                  <HashTagsContainer
                    tags={popularHashTags}
                    onClick={addHashTagForSubmit}
                    id={'popular-hashtags'}
                  />
                </div>
                <HashTagSearch onHashTagClick={addHashTagForSubmit} hashTags={hashTagsForSearch} />
                <NewHashTagsForm />
              </div>
            </Content>
            <hr />
            {/* Footer (Save button) */}
            <ActionButtons>
              <div className="dialog-footer">
                <Button onClick={onSubmit}>{t('save')}</Button>
              </div>
            </ActionButtons>
          </Dialog>

          {/* Displayed on form (Open dialog button) */}
          <div className="hashtags-label">
            <FormFieldLabel text={t(`projectBasicsForm.${name}`)} onClick={onEdit} />
          </div>
          {/* Displayed on form (Project hashtags) */}
          <HashTagsContainer tags={hashTagValues} />
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
        <ProjectHashTagsDialog
          {...field}
          {...fieldState}
          projectHashTags={field.value}
          label={label}
        />
      )}
    />
  );
};

ProjectHashTagsDialog.displayName = 'ProjectHashTagsDialog';

export default memo(ProjectHashTags);
