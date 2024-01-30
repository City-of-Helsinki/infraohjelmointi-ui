import { Button, IconTrash } from 'hds-react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { BaseSyntheticEvent, FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { selectProject } from '@/reducers/projectSlice';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { deleteProject } from '@/services/projectServices';
import { useNavigate } from 'react-router';
import { getPlanningClassesThunk, getCoordinationClassesThunk, getForcedToFrameClassesThunk } from '@/reducers/classSlice';
import { getPlanningGroupsThunk, getCoordinationGroupsThunk } from '@/reducers/groupSlice';
import { getPlanningLocationsThunk, getCoordinationLocationsThunk, getForcedToFrameLocationsThunk } from '@/reducers/locationSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { selectStartYear, setIsPlanningLoading } from '@/reducers/planningSlice';
interface IProjectFormbannerProps {
  onSubmit: () =>
    | ((e?: BaseSyntheticEvent<object, unknown, unknown> | undefined) => Promise<void>)
    | undefined;
  isDirty: boolean;
}

const ProjectFormBanner: FC<IProjectFormbannerProps> = ({ onSubmit, isDirty }) => {
  const dispatch = useAppDispatch();
  const startYear = useAppSelector(selectStartYear);
  const { t } = useTranslation();
  const project = useAppSelector(selectProject);
  const navigate = useNavigate();

  const { isConfirmed } = useConfirmDialog();

  const loadPlanningData = async (year: number) => {
    dispatch(setIsPlanningLoading(true));
    try {
      await dispatch(getPlanningGroupsThunk(year));
      await dispatch(getPlanningClassesThunk(year));
      await dispatch(getPlanningLocationsThunk(year));
    } catch (e) {
      console.log('Error loading planning data: ', e);
      dispatch(notifyError({ message: 'appDataError', type: 'notification', title: '500' }));
    } finally {
      dispatch(setIsPlanningLoading(false));
    }
  };

  const loadCoordinationData = async (year: number) => {
    dispatch(setIsPlanningLoading(true));
    try {
      await dispatch(getCoordinationGroupsThunk(year));
      await dispatch(getCoordinationClassesThunk(year));
      await dispatch(getCoordinationLocationsThunk(year));
      await dispatch(getForcedToFrameClassesThunk(year));
      await dispatch(getForcedToFrameLocationsThunk(year)); 
    } catch (e) {
      console.log('Error loading coordination data: ', e);
      dispatch(notifyError({ message: 'appDataError', type: 'notification', title: '500' }));
    } finally {
      dispatch(setIsPlanningLoading(false));
    }
  }

  const handleProjectDelete = useCallback(async () => {
    const confirm = await isConfirmed({
      dialogType: 'delete',
      confirmButtonText: 'deleteProject',
      title: t(`projectForm.deleteDialog.title`),
      description: t(`projectForm.deleteDialog.description`),
    });

    if (confirm !== false && project?.id) {
      try {
        await deleteProject(project.id);
        loadCoordinationData(startYear);
        loadPlanningData(startYear);
        
        // navigate back to history or if no history, go to planning view
        if (window.history.state && window.history.state.idx > 0) {
          navigate(-1);
        } else {
          navigate('/planning', { replace: true });
        }
      } catch (e) {
        console.log('Error deleting project');
      }
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
              data-testid={'open-delete-project-dialog-button'}
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
