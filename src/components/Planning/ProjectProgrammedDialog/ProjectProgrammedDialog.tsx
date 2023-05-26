import { useState, MouseEvent, FC, useCallback, memo } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';

import ProjectProgrammedSearch from './ProjectProgrammedSearch';
import { IProgrammedProjectSuggestions } from '@/interfaces/searchInterfaces';
import { IProjectsPatchRequestObject } from '@/interfaces/projectInterfaces';
import { useOptions } from '@/hooks/useOptions';
import { IPlanningRowSelections } from '@/interfaces/common';
import { patchProjects } from '@/services/projectServices';
import { createDateToEndOfYear, createDateToStartOfYear } from '@/utils/dates';

interface IDialogProps {
  handleClose: () => void;
  isOpen: boolean;
}

const DialogContainer: FC<IDialogProps> = memo(({ isOpen, handleClose }) => {
  const [projectsForSubmit, setProjectsForSubmit] = useState<Array<IProgrammedProjectSuggestions>>(
    [],
  );
  const phase =
    useOptions('phases', true).find((phase) => phase.label === 'programming')?.value || '';

  const buildRequestPayload = useCallback(
    (projects: Array<IProgrammedProjectSuggestions>): IProjectsPatchRequestObject => {
      const currentYear = new Date().getFullYear();
      return {
        data: projects.map((p) => ({
          id: p.value,
          data: {
            programmed: true,
            phase: phase,
            estPlanningStart: createDateToStartOfYear(currentYear),
            estPlanningEnd: createDateToEndOfYear(currentYear),
            estConstructionStart: createDateToStartOfYear(currentYear + 1),
            estConstructionEnd: createDateToEndOfYear(currentYear + 1),
          },
        })),
      };
    },
    [phase],
  );

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
      patchProjects(buildRequestPayload(projectsForSubmit))
        .then(() => {
          setProjectsForSubmit([]);
        })
        .catch(() => Promise.reject);
    },

    [buildRequestPayload, projectsForSubmit],
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
  selections: IPlanningRowSelections;
}

const ProjectProgrammedDialog: FC<ProjectProgrammedDialogProps> = ({ selections }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSetOpen = useCallback(() => setIsOpen((current) => !current), []);
  const onOpenGroupForm = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
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
      <DialogContainer isOpen={isOpen} handleClose={handleClose} />
      <div>
        <div data-testid="open-project-add-dialog-container" id="open-project-add-dialog-container">
          <button
            disabled={
              selections.selectedClass?.id || selections.selectedSubClass?.id ? false : true
            }
            onClick={onOpenGroupForm}
          >
            {t(`projectProgrammedForm.addProjectsToProgramming`)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgrammedDialog;
