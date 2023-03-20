import { useState, MouseEvent, FC, useCallback, MouseEventHandler } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';

import { IOption } from '@/interfaces/common';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import ProjectProgrammedSearch from './ProjectProgrammedSearch';
import { IProgrammedProjectSuggestions } from '@/interfaces/searchInterfaces';
import { IProjectRequestObject, IProjectsRequestObject } from '@/interfaces/projectInterfaces';
import { silentPatchMultipleProjectsThunk, silentPatchProjectThunk } from '@/reducers/projectSlice';
import { selectSelectedClass, selectSelectedSubClass } from '@/reducers/classSlice';
import { useOptions } from '@/hooks/useOptions';

interface IDialogProps {
  handleClose: () => void;
  isOpen: boolean;
}

interface IFormState {
  projectsForSubmit: Array<IProgrammedProjectSuggestions>;
}
interface IDialogButtonState {
  isOpen: boolean;
}

const DialogContainer: FC<IDialogProps> = ({ isOpen, handleClose }) => {
  const [formState, setFormState] = useState<IFormState>({
    projectsForSubmit: [],
  });
  const phase =
    useOptions('phases', true).find((phase) => phase.label === 'programming')?.value || '';

  const buildRequestPayload = useCallback(
    (projects: Array<IProgrammedProjectSuggestions>): IProjectsRequestObject => {
      return {
        data: projects.map((p) => ({ id: p.value, data: { programmed: true, phase: phase } })),
      };
    },
    [phase],
  );

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const onProjectClick = useCallback((value: IProgrammedProjectSuggestions | undefined) => {
    if (value) {
      setFormState((current) => ({
        ...current,
        projectsForSubmit: [...current.projectsForSubmit, value],
      }));
    }
  }, []);

  const onProjectSelectionDelete = useCallback((projectName: string) => {
    setFormState((current) => ({
      ...current,
      projectsForSubmit: current.projectsForSubmit.filter((p) => {
        return p.label !== projectName;
      }),
    }));
  }, []);
  const { projectsForSubmit } = formState;

  const { Header, Content, ActionButtons } = Dialog;

  const handleDialogClose = useCallback(() => {
    setFormState((current) => ({ ...current, projectsForSubmit: [] }));
    handleClose();
  }, [handleClose]);

  const onSubmit = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      dispatch(silentPatchMultipleProjectsThunk(buildRequestPayload(projectsForSubmit))).then(
        () => {
          setFormState((current) => ({
            ...current,
            projectsForSubmit: [],
          }));
        },
      );
    },

    [dispatch, buildRequestPayload, projectsForSubmit],
  );

  return (
    <div>
      {/* Dialog */}
      <div className="display-flex-col">
        <Dialog
          id="add-project-programmed-dialog"
          aria-labelledby={'add-project-programmed-dialog-label'}
          isOpen={isOpen}
          close={handleDialogClose}
          closeButtonLabelText={t('closeGroupFormWindow')}
          className="big-dialog"
          scrollable
        >
          {/* Header */}
          <Header id={'add-project-programmed-header'} title={t(`addProjectsToProgramming`)} />

          <Content>
            <div className="dialog-search-section">
              <br />

              <div>
                <ProjectProgrammedSearch
                  onProjectClick={onProjectClick}
                  onProjectSelectionDelete={onProjectSelectionDelete}
                  projectsForSubmit={projectsForSubmit}
                />
              </div>
            </div>
          </Content>
          <ActionButtons>
            <Button
              onClick={onSubmit}
              disabled={!(projectsForSubmit && projectsForSubmit.length > 0)}
              data-testid="search-projects-button"
            >
              {t('search')}
            </Button>
            <Button onClick={handleDialogClose} variant="secondary" data-testid="cancel-search">
              {t('cancel')}
            </Button>
          </ActionButtons>
        </Dialog>
      </div>
    </div>
  );
};

const ProjectProgrammedDialog: FC = () => {
  const selectedClass = useAppSelector(selectSelectedClass);
  const selectedSubClass = useAppSelector(selectSelectedSubClass);
  const { t } = useTranslation();
  const [DialogButtonState, setDialogButtonState] = useState<IDialogButtonState>({
    isOpen: false,
  });
  const { isOpen } = DialogButtonState;

  const handleSetOpen = useCallback(
    () =>
      setDialogButtonState((current) => ({
        isOpen: !current.isOpen,
      })),
    [],
  );
  const onOpenGroupForm = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleSetOpen();
    },
    [handleSetOpen],
  );
  const handleClose = useCallback(() => {
    handleSetOpen();
  }, [handleSetOpen]);
  return (
    <div>
      {isOpen && <DialogContainer isOpen={isOpen} handleClose={handleClose} />}
      <div>
        <div data-testid="open-project-add-dialog-button"></div>
        <Button
          disabled={!(selectedClass?.id || selectedSubClass?.id)}
          onClick={onOpenGroupForm}
          size="small"
        >
          {t(`addProjectsToProgramming`)}
        </Button>
      </div>
    </div>
  );
};

export default ProjectProgrammedDialog;
