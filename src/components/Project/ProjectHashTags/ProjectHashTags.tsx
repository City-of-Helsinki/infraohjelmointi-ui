import { useAppSelector } from '@/hooks/common';
import { HookFormControlType } from '@/interfaces/formInterfaces';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import {
  useState,
  MouseEvent,
  FC,
  forwardRef,
  Ref,
  useEffect,
  memo,
  useCallback,
  useMemo,
} from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from '../../shared/FormFieldLabel';
import HashTagsContainer from './HashTagsContainer';
import NewHashTagsForm from './NewHashTagsForm';
import HashTagSearch from './HashTagSearch';
import { IListItem } from '@/interfaces/common';
import { arrayHasValue, objectHasProperty } from '@/utils/common';
import { selectHashTags } from '@/reducers/hashTagsSlice';
import { IProject } from '@/interfaces/projectInterfaces';
import { patchProject } from '@/services/projectServices';
import './styles.css';

export interface IHashTagsObject {
  [key: string]: { value: string; id: string };
}

interface IProjectHashTagsDialogProps {
  label: string;
  projectHashTags: Array<string>;
  onChange: (tags: Array<string>) => void;
  toggleOpenDialog: (e: MouseEvent<HTMLButtonElement>) => void;
  openDialog: boolean;
  projectId?: string;
  projectName?: string;
}

interface IFormState {
  hashTagsObject: IHashTagsObject;
  hashTagsForSearch: Array<IListItem>;
  hashTagsForSubmit: Array<IListItem>;
  popularHashTags: Array<IListItem>;
}

const ProjectHashTagsDialog: FC<IProjectHashTagsDialogProps> = forwardRef(
  (
    { label, projectHashTags, openDialog, onChange, toggleOpenDialog, projectId, projectName },
    ref: Ref<HTMLDivElement>,
  ) => {
    const { Header, Content, ActionButtons } = Dialog;
    const allHashTags = useAppSelector(selectHashTags);
    const { t } = useTranslation();

    const [formState, setFormState] = useState<IFormState>({
      hashTagsObject: {},
      hashTagsForSearch: [],
      hashTagsForSubmit: [],
      popularHashTags: [],
    });

    const { hashTagsObject, hashTagsForSubmit, hashTagsForSearch, popularHashTags } = formState;

    // Create an object from the hashtags to not need to iterate when the user
    // chooses a hashtag from the search form
    // Populates popularHashTags list
    useEffect(() => {
      setFormState((current) => ({
        ...current,
        hashTagsObject: Object.fromEntries(
          allHashTags.hashTags.map(({ value, id }) => [
            value,
            {
              id,
              value,
            },
          ]),
        ),
        popularHashTags: allHashTags.popularHashTags,
      }));
    }, [allHashTags]);

    // Add the existing projectHashTags to hashTagsForSubmit
    useEffect(() => {
      if (projectHashTags && allHashTags) {
        const hashTagsForSubmit = allHashTags.hashTags.filter(({ id }) =>
          arrayHasValue(projectHashTags, id),
        );
        setFormState((current) => ({
          ...current,
          hashTagsForSubmit: hashTagsForSubmit,
          // Remove hashTags from popularHashTags and hashTagsForSearch that are already
          // added to the project for submission
          hashTagsForSearch: allHashTags.hashTags.filter(
            (ah) => hashTagsForSubmit.findIndex((hfs) => hfs.id === ah.id) === -1,
          ),
          popularHashTags: allHashTags.popularHashTags.filter(
            (ph) => hashTagsForSubmit.findIndex((hfs) => hfs.id === ph.id) === -1,
          ),
        }));
      }
    }, [projectHashTags]);

    const onHashTagDelete = useCallback((value: string) => {
      setFormState((current) => {
        const hashTagsForSubmit = current.hashTagsForSubmit.filter((hv) => hv.value !== value);

        return {
          ...current,
          hashTagsForSubmit: hashTagsForSubmit,
          hashTagsForSearch: allHashTags.hashTags.filter(
            (ah) => hashTagsForSubmit.findIndex((hfs) => hfs.id === ah.id) === -1,
          ),
          popularHashTags: allHashTags.popularHashTags.filter(
            (ph) => hashTagsForSubmit.findIndex((hfs) => hfs.id === ph.id) === -1,
          ),
        };
      });
    }, []);

    // Set a hashtag to be submitted, make sure that the hashtag exists
    // Make sure the value doesn't already exist in hashTagsForSubmit
    const onHashTagClick = useCallback(
      (value: string) => {
        if (
          objectHasProperty(hashTagsObject, value) &&
          hashTagsForSubmit.findIndex((hfs) => hfs.value === value) === -1
        ) {
          setFormState((current) => {
            const hashTagsForSubmit = [...current.hashTagsForSubmit, hashTagsObject[value]];

            return {
              ...current,
              hashTagsForSubmit: hashTagsForSubmit,
              hashTagsForSearch: allHashTags.hashTags.filter(
                (ah) => hashTagsForSubmit.findIndex((hfs) => hfs.id === ah.id) === -1,
              ),
              popularHashTags: allHashTags.popularHashTags.filter(
                (ph) => hashTagsForSubmit.findIndex((hfs) => hfs.id === ph.id) === -1,
              ),
            };
          });
        }
      },
      [hashTagsObject, hashTagsForSubmit],
    );

    // Submit hashTagsForSubmit and close the dialog
    const onSubmit = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        patchProject({
          id: projectId,
          data: { hashTags: hashTagsForSubmit.map((h) => hashTagsObject[h.value].id) },
        })
          .then(() => {
            onChange(hashTagsForSubmit.map((h) => hashTagsObject[h.value].id));
            toggleOpenDialog(e);
          })
          .catch(Promise.reject);
      },
      [hashTagsForSubmit, projectId, toggleOpenDialog, onChange, hashTagsObject],
    );

    const handleClose = useCallback(() => {
      setFormState((current) => ({
        ...current,
        hashTagsForSubmit: allHashTags.hashTags.filter(({ id }) =>
          arrayHasValue(projectHashTags, id),
        ),
      }));
      toggleOpenDialog(undefined as unknown as MouseEvent<HTMLButtonElement>);
    }, [allHashTags, toggleOpenDialog, projectHashTags]);

    return (
      <div className="input-wrapper" ref={ref}>
        {/* Dialog */}

        <Dialog
          id="hashtags-dialog"
          aria-labelledby={label}
          isOpen={openDialog}
          close={handleClose}
          closeButtonLabelText={t('closeHashTagsWindow')}
          className="big-dialog"
        >
          {/* Header */}
          <Header id={label} title={`${projectName} - ${t('manageHashTags')}`} />
          <hr />
          {/* Section 1 (Added hashtags ) */}
          <Content>
            <div className="content-container">
              <p className="font-bold">{t('projectHashTags')}</p>
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
                <p className="font-bold">{t('popularHashTags')}</p>
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
              <div data-testid="save-hash-tags-to-project">
                <Button onClick={onSubmit}>{t('save')}</Button>
              </div>
            </div>
          </ActionButtons>
        </Dialog>
      </div>
    );
  },
);

interface IProjectHashTagsProps {
  name: string;
  label: string;
  control: HookFormControlType;
  project: IProject | null;
}

interface IProjectHashTagsState {
  openDialog: boolean;
  projectHashTags: IListItem[];
}

const ProjectHashTags: FC<IProjectHashTagsProps> = ({ name, label, control, project }) => {
  const { t } = useTranslation();
  const allHashTags = useAppSelector(selectHashTags);
  const [state, setState] = useState<IProjectHashTagsState>({
    openDialog: false,
    projectHashTags: [],
  });

  const { projectId, projectName } = useMemo(() => {
    if (project?.hashTags) {
      setState((current) => ({
        ...current,
        projectHashTags: allHashTags.hashTags.filter(({ id }) =>
          arrayHasValue(project.hashTags, id),
        ),
      }));
    }
    return {
      projectId: project?.id,
      projectName: project?.name,
    };
  }, [project]);

  const toggleOpenDialog = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }
    setState((current) => ({ ...current, openDialog: !current.openDialog }));
  }, []);

  const { openDialog, projectHashTags } = state;

  return (
    <div className="input-wrapper" id="hashTags" data-testid="hashTags">
      {openDialog && (
        <Controller
          name={name}
          control={control as Control<FieldValues>}
          render={({ field, fieldState }) => (
            <ProjectHashTagsDialog
              {...field}
              {...fieldState}
              projectHashTags={field.value}
              label={label}
              toggleOpenDialog={toggleOpenDialog}
              openDialog={openDialog}
              projectId={projectId}
              projectName={projectName}
            />
          )}
        />
      )}
      {/* Displayed on form (Open dialog button) */}
      <div className="flex flex-col">
        <div className="hashtags-label">
          <FormFieldLabel
            dataTestId="open-hash-tag-dialog-button"
            text={t(`projectBasicsForm.${name}`)}
            onClick={toggleOpenDialog}
          />
        </div>
        {/* Displayed on form (Project hashtags) */}
        <HashTagsContainer tags={projectHashTags} />
      </div>
    </div>
  );
};

ProjectHashTagsDialog.displayName = 'ProjectHashTagsDialog';

export default memo(ProjectHashTags);
