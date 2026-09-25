import { Button } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useTransitionProjectProgrammeStatusMutation } from '@/api/projectProgrammeApi';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import {
  ProjectProgrammeStatus,
  ProjectProgrammeStatusTransitionButtonsProps,
} from '@/interfaces/projectProgrammeInterfaces';

function ProjectProgrammeStatusTransitionButtons({
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
  buttonOverrides,
}: Readonly<ProjectProgrammeStatusTransitionButtonsProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [transitionStatus] = useTransitionProjectProgrammeStatusMutation();

  function notifyMissingProject() {
    dispatch(
      notifyError({
        title: 'saveError',
        message: 'projectNotFound',
        type: 'toast',
      }),
    );
  }

  async function handleProgrammeStatusTransition(status: ProjectProgrammeStatus) {
    if (!effectiveProjectProgrammeId) {
      notifyMissingProject();
      return;
    }

    try {
      await transitionStatus({ id: effectiveProjectProgrammeId, to: status }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message:
            status === 'COMPLETE'
              ? 'projectProgrammeMarkReadySuccess'
              : 'projectProgrammeReturnToDraftSuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message:
            status === 'COMPLETE'
              ? 'projectProgrammeMarkReadyError'
              : 'projectProgrammeReturnToDraftError',
          type: 'toast',
        }),
      );
    }
  }

  return (
    <>
      {isProjectProgrammeComplete && (
        <Button
          type="button"
          onClick={() => handleProgrammeStatusTransition('DRAFT')}
          variant={buttonOverrides?.markDraft?.variant}
          theme={buttonOverrides?.markDraft?.theme}
          style={buttonOverrides?.markDraft?.style}
        >
          {t('projectProgrammeForm.returnToDraft')}
        </Button>
      )}
      {!isProjectProgrammeComplete && (
        <Button
          type="button"
          onClick={() => handleProgrammeStatusTransition('COMPLETE')}
          variant={buttonOverrides?.markReady?.variant}
          theme={buttonOverrides?.markReady?.theme}
          style={buttonOverrides?.markReady?.style}
        >
          {t('projectProgrammeForm.markReady')}
        </Button>
      )}
    </>
  );
}

export default ProjectProgrammeStatusTransitionButtons;
