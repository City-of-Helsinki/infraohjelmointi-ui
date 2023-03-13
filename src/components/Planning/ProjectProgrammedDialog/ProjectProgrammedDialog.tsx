import { useState, MouseEvent, FC, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';

import { IOption } from '@/interfaces/common';
import { useAppDispatch } from '@/hooks/common';
import ProjectProgrammedSearch from './ProjectProgrammedSearch';

interface IDialogProps {
  handleClose: () => void;
  isOpen: boolean;
}

interface IFormState {
  projectsForSubmit: Array<IOption>;
}
interface IDialogButtonState {
  isOpen: boolean;
}
// const buildRequestPayload = (form: IGroupForm, projects: Array<IOption>): IGroupRequest => {
//   // submit Class or subclass if present, submit division or subDivision if present, submit a name, submit projects

//   const payload: IGroupRequest = {
//     name: '',
//     classRelation: '',
//     districtRelation: '',
//     projects: [],
//   };

//   payload.name = form.name;
//   payload.classRelation = form.subClass?.value || form.class?.value || '';
//   payload.districtRelation = form.subDivision?.value || form.division?.value || '';
//   payload.projects = projects.length > 0 ? projects.map((p) => p.value) : [];

//   return payload;
// };

const DialogContainer: FC<IDialogProps> = ({ isOpen, handleClose }) => {
  const [formState, setFormState] = useState<IFormState>({
    projectsForSubmit: [],
  });

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const onProjectClick = useCallback((value: IOption | undefined) => {
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
  }, []);

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
          <Header id={'group-form-dialog-label'} title={t(`createSummingGroups`)} />

          <Content>
            <div className="dialog-section">
              <br />
              <div>
                <p className="font-bold">{t(`groupForm.groupCreationDescription1`)}</p>
                <p className="font-bold">{t(`groupForm.groupCreationDescription2`)}</p>
              </div>

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
              //   onClick={handleSubmit(onSubmit)}
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
        <div data-testid="open-group-form-dialog-button"></div>
        <Button onClick={onOpenGroupForm} size="small">
          {t(`createSummingGroups`)}
        </Button>
      </div>
    </div>
  );
};

export default ProjectProgrammedDialog;
