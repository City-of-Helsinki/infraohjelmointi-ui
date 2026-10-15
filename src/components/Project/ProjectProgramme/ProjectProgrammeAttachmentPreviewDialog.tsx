import AttachmentPreviewDialog from '@/components/shared/AttachmentPreviewDialog';
import { IProjectProgrammeAttachment } from '@/interfaces/projectProgrammeInterfaces';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface IAttachmentPreview {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
}

interface IProjectProgrammeAttachmentPreviewDialogProps {
  preview: IAttachmentPreview | null;
  onClose: () => void;
  imageAttachments: IProjectProgrammeAttachment[];
  onPrevious: () => void;
  onNext: () => void;
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
  imageAttachments,
  onPrevious,
  onNext,
}: Readonly<IProjectProgrammeAttachmentPreviewDialogProps>) {
  const { t } = useTranslation();

  if (!preview) {
    return null;
  }

  const previewKind = getPreviewKind(preview.contentType, preview.fileName);

  return (
    <AttachmentPreviewDialog
      id="project-programme-attachment-preview-dialog"
      isOpen
      onClose={onClose}
      ariaLabel={preview.fileName}
      contentTestId="attachment-preview-content"
      image={
        previewKind === 'image'
          ? { downloadUrl: preview.url, fileName: preview.fileName }
          : undefined
      }
      navigation={
        previewKind === 'image'
          ? {
              selectedIndex: imageAttachments.findIndex(
                (attachment) => attachment.id === preview.id,
              ),
              count: imageAttachments.length,
              onPrevious,
              onNext,
            }
          : undefined
      }
    >
      {previewKind !== 'image' && (
        <div className="w-full pt-20">
          {previewKind === 'pdf' ? (
            <iframe src={preview.url} title={preview.fileName} className="h-[70vh] w-full" />
          ) : (
            <>
              <p>{t('projectProgrammeForm.attachmentPreviewNotSupported')}</p>
              <a href={preview.url} download={preview.fileName} className="text-link">
                {t('projectProgrammeForm.downloadAttachment')}
              </a>
            </>
          )}
        </div>
      )}
    </AttachmentPreviewDialog>
  );
}

export default memo(ProjectProgrammeAttachmentPreviewDialog);
