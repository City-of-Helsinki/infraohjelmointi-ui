import { useState, MouseEvent, FC, useCallback, memo } from 'react';
import { Button, ButtonVariant } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import Loader from '@/components/Loader';

import ProjectProgrammedSearch from './ProjectProgrammedSearch';
import { IProgrammedProjectSuggestions } from '@/interfaces/searchInterfaces';
import { IProjectsPatchRequestObject } from '@/interfaces/projectInterfaces';
import { useOptions } from '@/hooks/useOptions';
import { patchProjects } from '@/services/projectServices';
import { createDateToEndOfYear, createDateToStartOfYear } from '@/utils/dates';
import { useAppDispatch } from '@/hooks/common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';

interface ProjectProgrammedDialogProps {
  isVisible: boolean;
  onCloseProjectProgrammedDialog: () => void;
}

const ProjectProgrammedDialog: FC<ProjectProgrammedDialogProps> = memo(
  ({ isVisible, onCloseProjectProgrammedDialog }) => {
    const [projectsForSubmit, setProjectsForSubmit] = useState<
      Array<IProgrammedProjectSuggestions>
    >([]);
    const dispatch = useAppDispatch();

    const phase = useOptions('phases').find((phase) => phase.label === 'programming')?.value || '';

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
    const onProjectsSelect = useCallback((projects: IProgrammedProjectSuggestions[]) => {
      if (projects.length > 0) {
        setProjectsForSubmit((current) => [...current, ...projects]);
      }
    }, []);

    const onProjectSelectionDelete = useCallback((projectName: string) => {
      setProjectsForSubmit((current) => current.filter((p) => p.label !== projectName));
    }, []);

    const { Header, Content, ActionButtons } = Dialog;

    const handleDialogClose = useCallback(() => {
      setProjectsForSubmit([]);
      onCloseProjectProgrammedDialog();
    }, [onCloseProjectProgrammedDialog]);

    const onSubmit = useCallback(
      async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dispatch(
          setLoading({
            text: 'Patching programmed projects',
            id: 'loading-programmed-projects-patched',
          }),
        );
        try {
          await patchProjects(buildRequestPayload(projectsForSubmit));
          setProjectsForSubmit([]);
        } catch (e) {
          console.log('Error setting project to programmed: ', e);
        } finally {
          dispatch(clearLoading('loading-programmed-projects-patched'));
        }
      },

      [buildRequestPayload, projectsForSubmit, dispatch],
    );

    return (
      <div>
        {/* Dialog */}
        <div className="display-flex-col">
          <Dialog
            id="add-project-programmed-dialog"
            aria-labelledby={'add-project-programmed-dialog-label'}
            isOpen={isVisible}
            close={handleDialogClose}
            closeButtonLabelText={t('closeProjectProgrammedDialog')}
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
                    onProjectsSelect={onProjectsSelect}
                    onProjectSelectionDelete={onProjectSelectionDelete}
                    projectsForSubmit={projectsForSubmit}
                  />
                </div>
              </div>
              <Loader />
            </Content>
            <ActionButtons>
              <Button
                onClick={onSubmit}
                disabled={!(projectsForSubmit && projectsForSubmit.length > 0)}
                data-testid="add-projects-button"
              >
                {t('projectProgrammedForm.addProjects')}
              </Button>
              <Button
                onClick={handleDialogClose}
                variant={ButtonVariant.Secondary}
                data-testid="cancel-search"
              >
                {t('cancel')}
              </Button>
            </ActionButtons>
          </Dialog>
        </div>
      </div>
    );
  },
);

ProjectProgrammedDialog.displayName = 'Project Programmed Dialog';

export default ProjectProgrammedDialog;
