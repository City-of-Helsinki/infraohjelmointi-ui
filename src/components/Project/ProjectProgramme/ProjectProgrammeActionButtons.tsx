import { Button, ButtonVariant, IconDownload, IconLink } from 'hds-react';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransitionProjectProgrammeStatusMutation } from '@/api/projectProgrammeApi';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';

type ActionButtonVariant = Exclude<ButtonVariant, ButtonVariant.Supplementary>;

type ActionButtonVisualProps = Pick<ComponentProps<typeof Button>, 'theme' | 'style'> & {
  variant?: ActionButtonVariant;
};

export interface ProjectProgrammeActionButtonsOverrides {
  markReady?: ActionButtonVisualProps;
  copyLink?: ActionButtonVisualProps;
  makePdf?: ActionButtonVisualProps;
}

interface ProjectProgrammeActionButtonsProps {
  isProjectProgrammeComplete: boolean;
  effectiveProjectProgrammeId: string;
  buttonOverrides?: ProjectProgrammeActionButtonsOverrides;
}

function ProjectProgrammeActionButtons({
  isProjectProgrammeComplete,
  effectiveProjectProgrammeId,
  buttonOverrides,
}: Readonly<ProjectProgrammeActionButtonsProps>) {
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
    <>
      <Button
        type="button"
        onClick={handleMarkProgrammeReady}
        disabled={isProjectProgrammeComplete}
        variant={buttonOverrides?.markReady?.variant}
        theme={buttonOverrides?.markReady?.theme}
        style={buttonOverrides?.markReady?.style}
      >
        {t('projectProgrammeForm.markReady')}
      </Button>
      <Button
        variant={buttonOverrides?.copyLink?.variant ?? ButtonVariant.Secondary}
        theme={buttonOverrides?.copyLink?.theme}
        style={buttonOverrides?.copyLink?.style}
        iconStart={<IconLink />}
        type="button"
        onClick={handleCopyLinkClick}
      >
        {t('copyLink')}
      </Button>
      <Button
        variant={buttonOverrides?.makePdf?.variant ?? ButtonVariant.Secondary}
        theme={buttonOverrides?.makePdf?.theme}
        style={buttonOverrides?.makePdf?.style}
        iconStart={<IconDownload />}
        type="button"
        onClick={handleGeneratePdfClick}
      >
        {t('projectProgrammeForm.makePdf')}
      </Button>
    </>
  );
}

export default ProjectProgrammeActionButtons;
