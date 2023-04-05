import { useState, MouseEvent, FC, useCallback, memo } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/hooks/common';
import ProjectProgrammedSearch from './ProjectProgrammedSearch';
import { IProgrammedProjectSuggestions } from '@/interfaces/searchInterfaces';
import { IProjectsRequestObject } from '@/interfaces/projectInterfaces';
import { silentPatchProjectsThunk } from '@/reducers/projectSlice';
import { selectSelectedClass, selectSelectedSubClass } from '@/reducers/classSlice';
import { useOptions } from '@/hooks/useOptions';
import { current } from '@reduxjs/toolkit';

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
          closeButtonLabelText={t('closeGroupFormWindow')}
          className="big-dialog"
          scrollable
        >
          {/* Header */}
          <Header id={'add-project-programmed-header'} title={t(`addProjectsToProgramming`)} />

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
});

DialogContainer.displayName = 'Project Programmed Dialog';

const ProjectProgrammedDialog: FC = () => {
  const selectedClass = useAppSelector(selectSelectedClass);
  const selectedSubClass = useAppSelector(selectSelectedSubClass);
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
  }, [toggleSetOpen]);
  return (
    <div>
      <DialogContainer isOpen={isOpen} handleClose={handleClose} />
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
