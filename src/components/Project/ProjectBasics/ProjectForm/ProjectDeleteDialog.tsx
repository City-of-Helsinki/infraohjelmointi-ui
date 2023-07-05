import { FC, memo, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';
import { useNavigate } from 'react-router';

import './styles.css';
import { deleteProject } from '@/services/projectServices';

interface ProjectDeleteDialogProps {
  isVisible: boolean;
  onCloseProjectDeleteDialog: () => void;
  id: string;
}

const ProjectDeleteDialog: FC<ProjectDeleteDialogProps> = memo(
  ({ isVisible, onCloseProjectDeleteDialog, id }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const handleDeleteProject = useCallback(() => {
      deleteProject(id)
        .then(() => {
          onCloseProjectDeleteDialog();
          // navigate back to history or if no history, go to planning view
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate('/planning', { replace: true });
          }
        })
        .catch(Promise.reject);
    }, [id, onCloseProjectDeleteDialog, navigate]);
    const { Header, Content, ActionButtons } = Dialog;

    return (
      <div>
        {/* Dialog */}
        <div className="display-flex-col">
          <Dialog
            variant={'danger'}
            id="delete-project-dialog"
            aria-labelledby="delete-project-dialog"
            isOpen={isVisible}
          >
            <Header
              id={'delete-project-dialog-header'}
              title={t(`projectForm.deleteDialog.title`)}
              iconLeft={<IconAlertCircle aria-hidden="true" />}
            />
            <Content>
              <p className="text-body">{t(`projectForm.deleteDialog.description`)}</p>
            </Content>
            <ActionButtons>
              <Button onClick={onCloseProjectDeleteDialog} theme="black" variant="secondary">
                {t(`cancel`)}
              </Button>
              <Button
                data-testid={`delete-project-${id}`}
                variant="danger"
                iconLeft={<IconTrash aria-hidden="true" />}
                onClick={handleDeleteProject}
              >
                {t(`deleteProject`)}
              </Button>
            </ActionButtons>
          </Dialog>
        </div>
      </div>
    );
  },
);

ProjectDeleteDialog.displayName = 'Delete Project Dialog';

export default ProjectDeleteDialog;
