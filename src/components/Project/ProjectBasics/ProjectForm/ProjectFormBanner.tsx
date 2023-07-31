import { Button, IconTrash } from 'hds-react';
import { useAppSelector } from '@/hooks/common';
import { BaseSyntheticEvent, FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { selectProject } from '@/reducers/projectSlice';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { deleteProject } from '@/services/projectServices';
import { useNavigate } from 'react-router';
interface IProjectFormbannerProps {
  onSubmit: () =>
    | ((e?: BaseSyntheticEvent<object, unknown, unknown> | undefined) => Promise<void>)
    | undefined;
  isDirty: boolean;
}
const ProjectFormBanner: FC<IProjectFormbannerProps> = ({ onSubmit, isDirty }) => {
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const navigate = useNavigate();

  const { isConfirmed } = useConfirmDialog();
  const handleProjectDelete = useCallback(async () => {
    const confirm = await isConfirmed({
      dialogType: 'deleteProject',
      title: t(`projectForm.deleteDialog.title`),
      description: t(`projectForm.deleteDialog.description`),
    });
    if (confirm !== false && project?.id) {
      deleteProject(project.id)
        .then(() => {
          // navigate back to history or if no history, go to planning view
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate('/planning', { replace: true });
          }
        })
        .catch(Promise.reject);
    }
  }, [isConfirmed]);

  return (
    <div className="project-form-banner">
      <div className="project-form-banner-container">
        <Button onClick={onSubmit()} disabled={!isDirty} data-testid="submit-project-button">
          {t('saveChanges')}
        </Button>
        {project?.id && (
          <>
            {/** Add logic for disabling button later based on user type */}
            <Button
              data-testid={'delete-project-dialog-button'}
              disabled={false}
              iconLeft={<IconTrash />}
              variant="supplementary"
              onClick={handleProjectDelete}
            >
              {t(`deleteProject`)}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ProjectFormBanner);
