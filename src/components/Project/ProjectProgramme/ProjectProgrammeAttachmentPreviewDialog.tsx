import { Button, ButtonVariant, Dialog } from 'hds-react';
import { IconCross } from 'hds-react/icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface IAttachmentPreview {
  fileName: string;
  contentType: string;
  url: string;
}

interface IProjectProgrammeAttachmentPreviewDialogProps {
  preview: IAttachmentPreview | null;
  onClose: () => void;
}

type PreviewKind = 'image' | 'pdf' | 'unsupported';

export function getPreviewKind(contentType: string, fileName: string): PreviewKind {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (contentType.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(extension ?? '')) {
    return 'image';
  }
  if (contentType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }
  return 'unsupported';
}

function ProjectProgrammeAttachmentPreviewDialog({
  preview,
  onClose,
}: Readonly<IProjectProgrammeAttachmentPreviewDialogProps>) {
  const { t } = useTranslation();

  if (!preview) {
    return null;
  }

  const previewKind = getPreviewKind(preview.contentType, preview.fileName);

  return (
    <Dialog
      id="project-programme-attachment-preview-dialog"
      aria-labelledby="project-programme-attachment-preview-dialog-title"
      isOpen
      theme={{ '--accent-line-color': 'var(--color-white)' }}
      style={{ maxWidth: '1200px', width: '80vw' }}
      close={onClose}
      closeButtonLabelText={t('attachmentSlideshowDialog.close')}
    >
      <Dialog.Header
        id="project-programme-attachment-preview-dialog-title"
        title={preview.fileName}
      />
      <Dialog.Content>
        <div className="flex flex-col items-center" data-testid="attachment-preview-content">
          {previewKind === 'image' && (
            <img
              src={preview.url}
              alt={preview.fileName}
              className="max-h-[70vh] w-full rounded-sm object-contain"
            />
          )}
          {previewKind === 'pdf' && (
            <iframe src={preview.url} title={preview.fileName} className="h-[70vh] w-full" />
          )}
          {previewKind === 'unsupported' && (
            <>
              <p>{t('projectProgrammeForm.attachmentPreviewNotSupported')}</p>
              <a href={preview.url} download={preview.fileName} className="text-link">
                {t('projectProgrammeForm.downloadAttachment')}
              </a>
            </>
          )}
        </div>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button onClick={onClose} variant={ButtonVariant.Secondary} iconStart={<IconCross />}>
          {t('attachmentSlideshowDialog.close')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
}

export default memo(ProjectProgrammeAttachmentPreviewDialog);
