import { useState, MouseEvent, FC, useCallback, memo } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammedSearch from './ProjectProgrammedSearch';
import { IProgrammedProjectSuggestions } from '@/interfaces/searchInterfaces';
import { IProjectsPatchRequestObject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectsThunk } from '@/reducers/projectSlice';
import { useOptions } from '@/hooks/useOptions';
import usePlanningRows, { IPlanningRowSelections } from '@/hooks/usePlanningRows';

interface IDialogProps {
  handleClose: () => void;
  isOpen: boolean;
  onAddProject: () => void;
}

const DialogContainer: FC<IDialogProps> = memo(({ isOpen, handleClose, onAddProject }) => {
  const [projectsForSubmit, setProjectsForSubmit] = useState<Array<IProgrammedProjectSuggestions>>(
    [],
  );
  const phase =
    useOptions('phases', true).find((phase) => phase.label === 'programming')?.value || '';

  const buildRequestPayload = useCallback(
    (projects: Array<IProgrammedProjectSuggestions>): IProjectsPatchRequestObject => {
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
      setProjectsForSubmit((current) => [...current, value]);
    }
  }, []);

  const onProjectSelectionDelete = useCallback((projectName: string) => {
    setProjectsForSubmit((current) => current.filter((p) => p.label !== projectName));
  }, []);

  const { Header, Content, ActionButtons } = Dialog;

  const handleDialogClose = useCallback(() => {
    setProjectsForSubmit([]);
    handleClose();
  }, [handleClose]);

  const onSubmit = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      dispatch(silentPatchProjectsThunk(buildRequestPayload(projectsForSubmit))).then(() => {
        onAddProject();
        setProjectsForSubmit([]);
      });
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
          closeButtonLabelText={t('closeProjectProgrammedDialog')}
          className="big-dialog"
          scrollable
        >
          {/* Header */}
          <Header
            id={'add-project-programmed-header'}
            title={t(`projectProgrammedForm.addProjectsToProgramming`)}
          />

          <Content>
            <div className="dialog-search-section">
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
              data-testid="add-projects-button"
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
});

DialogContainer.displayName = 'Project Programmed Dialog';

interface ProjectProgrammedDialogProps {
  onAddProject: () => void;
  selections: IPlanningRowSelections;
}

const ProjectProgrammedDialog: FC<ProjectProgrammedDialogProps> = ({
  onAddProject,
  selections,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSetOpen = useCallback(() => setIsOpen((current) => !current), []);
  const onOpenGroupForm = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      toggleSetOpen();
    },
    [toggleSetOpen],
  );
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);
  return (
    <div>
      <DialogContainer isOpen={isOpen} handleClose={handleClose} onAddProject={onAddProject} />
      <div>
        <div data-testid="open-project-add-dialog-container" id="open-project-add-dialog-container">
          <div
            onClick={
              selections.selectedClass?.id || selections.selectedSubClass?.id
                ? onOpenGroupForm
                : () => {
                    return;
                  }
            }
          >
            {t(`projectProgrammedForm.addProjectsToProgramming`)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgrammedDialog;
