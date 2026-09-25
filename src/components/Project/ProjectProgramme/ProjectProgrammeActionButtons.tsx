import { Button, ButtonVariant, IconDownload, IconLink } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/common';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { ProjectProgrammeActionButtonsProps } from '@/interfaces/projectProgrammeInterfaces';

function ProjectProgrammeActionButtons({
  buttonOverrides,
}: Readonly<ProjectProgrammeActionButtonsProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

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

  return (
    <span style={{ display: 'flex', gap: '1.5rem' }}>
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
    </span>
  );
}

export default ProjectProgrammeActionButtons;
