import { Button, ButtonVariant, IconLink } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { useTransitionProjectProgrammeStatusMutation } from '@/api/projectProgrammeApi';

interface ProjectProgrammeBottomBarProps {
  isBriefProgramme: boolean;
  hasSavedExtendedSection: boolean;
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
  handleSwitchType: () => Promise<unknown>;
}

function ProjectProgrammeBottomBar({
  isBriefProgramme,
  hasSavedExtendedSection,
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
  handleSwitchType,
}: Readonly<ProjectProgrammeBottomBarProps>) {
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

  function handleCopyLinkClick() {
    navigator.clipboard
      .writeText(globalThis.location.href)
      .then(() => {
        dispatch(
          notifySuccess({
            title: 'linkCopied',
            message: 'linkCopiedToClipboard',
            type: 'toast',
            duration: 3500,
          }),
        );
      })
      .catch(() => {
        dispatch(
          notifyError({
            title: 'undefined',
            message: 'linkCopyFailed',
            type: 'toast',
            duration: 3500,
          }),
        );
      });
  }

  function handleGeneratePdfClick() {
    dispatch(
      notifySuccess({
        title: 'update',
        message: 'projectProgrammePdfGenerationNotImplemented',
        type: 'toast',
      }),
    );
  }

  async function handleMarkProgrammeReady() {
    if (!effectiveProjectProgrammeId) {
      notifyMissingProject();
      return;
    }

    try {
      await transitionStatus({ id: effectiveProjectProgrammeId, to: 'COMPLETE' }).unwrap();
      dispatch(
        notifySuccess({
          title: 'saveSuccess',
          message: 'projectProgrammeMarkReadySuccess',
          type: 'toast',
        }),
      );
    } catch {
      dispatch(
        notifyError({
          title: 'saveError',
          message: 'projectProgrammeMarkReadyError',
          type: 'toast',
        }),
      );
    }
  }

  return (
    <div className="project-form-banner">
      <div className="project-form-banner-container">
        <div className="project-programme-actions">
          <Button
            type="button"
            onClick={handleMarkProgrammeReady}
            disabled={isProjectProgrammeComplete}
          >
            {t('projectProgrammeForm.markReady')}
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            iconStart={<IconLink />}
            type="button"
            onClick={handleCopyLinkClick}
          >
            {t('copyLink')}
          </Button>
          <Button variant={ButtonVariant.Secondary} type="button" onClick={handleGeneratePdfClick}>
            {t('projectProgrammeForm.makePdf')}
          </Button>
          {!isBriefProgramme && !hasSavedExtendedSection && (
            <Button variant={ButtonVariant.Secondary} type="button" onClick={handleSwitchType}>
              {t('projectProgrammeForm.switchToBriefProgramme')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectProgrammeBottomBar;
