import { Button, IconTrash } from 'hds-react';
import { useAppSelector } from '@/hooks/common';
import { BaseSyntheticEvent, FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectDeleteDialog from './ProjectDeleteDialog';
import { selectProject } from '@/reducers/projectSlice';
interface IProjectFormbannerProps {
  onSubmit: () =>
    | ((e?: BaseSyntheticEvent<object, unknown, unknown> | undefined) => Promise<void>)
    | undefined;
  isDirty: boolean;
}
const ProjectFormBanner: FC<IProjectFormbannerProps> = ({ onSubmit, isDirty }) => {
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);
  const handleDialogOpen = useCallback(() => {
    setIsDialogOpen(true);
  }, []);
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
              onClick={handleDialogOpen}
            >
              {t(`deleteProject`)}
            </Button>
            <ProjectDeleteDialog
              isVisible={isDialogOpen}
              onCloseProjectDeleteDialog={handleDialogClose}
              id={project.id}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ProjectFormBanner);
