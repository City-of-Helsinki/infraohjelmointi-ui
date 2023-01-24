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

interface IFormState {
  hashTagsObject: IHashTagsObject;
  hashTagsForSearch: Array<IListItem>;
  hashTagsForSubmit: Array<string>;
  popularHashTags: Array<string>;
  isOpen: boolean;
}

const ProjectHashTagsDialog: FC<IProjectHashTagsDialogProps> = forwardRef(
  ({ name, label, projectHashTags, onChange }, ref: Ref<HTMLDivElement>) => {
    const { Header, Content, ActionButtons } = Dialog;
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const allHashTags = useAppSelector((state: RootState) => state.lists.hashTags, _.isEqual);
    const projectId = useAppSelector(
      (state: RootState) => state.project.selectedProject?.id,
      _.isEqual,
    );
    const projectName = useAppSelector(
      (state: RootState) => state.project.selectedProject?.name,
      _.isEqual,
    );

    const [formState, setFormState] = useState<IFormState>({
      hashTagsObject: {},
      hashTagsForSearch: [],
      hashTagsForSubmit: [],
      popularHashTags: [],
      isOpen: false,
    });

    const { hashTagsObject, hashTagsForSubmit, hashTagsForSearch, popularHashTags, isOpen } =
      formState;

    // Create an object from the hashtags to not need to iterate when the user
    // chooses a hashtag from the search form
    useEffect(() => {
      setFormState((current) => ({
        ...current,
        hashTagsObject: Object.fromEntries(
          allHashTags.map(({ value, id }) => [
            value,
            {
              value,
              id,
            },
          ]),
        ),
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allHashTags]);

    // Add the existing projectHashTags to hashTagsForSubmit
    useEffect(() => {
      if (projectHashTags && allHashTags) {
        setFormState((current) => ({
          ...current,
          hashTagsForSubmit: allHashTags
            .filter(({ id }) => projectHashTags.indexOf(id) !== -1)
            .map((v) => v.value),
        }));
      }
    }, [projectHashTags, allHashTags]);

    // Remove hashTags from popularHashTags and hashTagsForSearch that are already
    // added to the project for submission
    useEffect(() => {
      setFormState((current) => ({
        ...current,
        hashTagsForSearch: allHashTags.filter((ah) => hashTagsForSubmit.indexOf(ah.value) === -1),
        popularHashTags: current.popularHashTags.filter(
          (ph) => hashTagsForSubmit.indexOf(ph) === -1,
        ),
      }));
    }, [allHashTags, hashTagsForSubmit]);

    const onHashTagDelete = useCallback((hashTag: string) => {
      setFormState((current) => ({
        ...current,
        hashTagsForSubmit: current.hashTagsForSubmit.filter((hv) => hv !== hashTag),
      }));
    }, []);

    const onHashTagClick = useCallback(
      (value: string) => {
        setFormState((current) => ({
          ...current,
          hashTagsForSubmit: [...current.hashTagsForSubmit, hashTagsObject[value].value],
        }));
      },
      [hashTagsObject],
    );

    const handleSetOpen = useCallback(
      () => setFormState((current) => ({ ...current, isOpen: !current.isOpen })),
      [],
    );

    const onOpenHashTagsForm = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleSetOpen();
      },
      [handleSetOpen],
    );

    // Submit hashTagsForSubmit and close the dialog
    const onSubmit = useCallback(() => {
      dispatch(
        silentPatchProjectThunk({
          data: { hashTags: hashTagsForSubmit.map((h) => hashTagsObject[h].id) },
          id: projectId,
        }),
      );
      handleSetOpen();
      onChange(hashTagsForSubmit);
    }, [dispatch, hashTagsForSubmit, projectId, handleSetOpen, onChange, hashTagsObject]);

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
                  tags={hashTagsForSubmit}
                  onDelete={onHashTagDelete}
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
                    onClick={onHashTagClick}
                    id={'popular-hashtags'}
                  />
                </div>
                <HashTagSearch onHashTagClick={onHashTagClick} hashTags={hashTagsForSearch} />
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
            <FormFieldLabel text={t(`projectBasicsForm.${name}`)} onClick={onOpenHashTagsForm} />
          </div>
          {/* Displayed on form (Project hashtags) */}
          <HashTagsContainer tags={hashTagsForSubmit} />
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
