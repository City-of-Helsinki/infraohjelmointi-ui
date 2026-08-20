import { stringToDateTime } from '@/utils/dates';
import { Button, ButtonVariant, IconEye, IconTrash } from 'hds-react';
import { useCallback, useMemo, useState } from 'react';
import AttachmentSlideshowDialog from './AttachmentSlideshowDialog';
import { useTranslation } from 'react-i18next';
import { INoteImage } from '@/interfaces/noteInterfaces';
import useConfirmDialog from '@/hooks/useConfirmDialog';

interface INoteAttachmentListProps {
  attachments: INoteImage[];
  onDeleteAttachment?: (imageId: string) => void;
}

const formatSizeToKilobytes = (size?: number) => {
  if (size === undefined || size === null || Number.isNaN(size)) {
    return '-';
  }

  return `${Math.round(size / 1024)} kB`;
};

export default function NoteAttachmentList({
  attachments,
  onDeleteAttachment,
}: INoteAttachmentListProps) {
  const { t } = useTranslation();
  const { isConfirmed } = useConfirmDialog();
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);

  const hasAttachments = attachments.length > 0;

  const closeSlideshow = useCallback(() => setIsSlideshowOpen(false), []);

  const handleOpenImage = useCallback((attachmentIndex: number) => {
    setSelectedAttachmentIndex(attachmentIndex);
    setIsSlideshowOpen(true);
  }, []);

  const handleNextImage = useCallback(() => {
    setSelectedAttachmentIndex((currentIndex) => (currentIndex + 1) % attachments.length);
  }, [attachments.length]);

  const handlePreviousImage = useCallback(() => {
    setSelectedAttachmentIndex(
      (currentIndex) => (currentIndex - 1 + attachments.length) % attachments.length,
    );
  }, [attachments.length]);

  const currentAttachment = useMemo(
    () => attachments[selectedAttachmentIndex],
    [attachments, selectedAttachmentIndex],
  );

  const handleDeleteAttachment = useCallback(
    async (imageId: string): Promise<void> => {
      const confirm = await isConfirmed({
        dialogType: 'delete',
        confirmButtonText: t('noteAttachments.deleteDialog.delete'),
        title: t('noteAttachments.deleteDialog.title'),
        description: t('noteAttachments.deleteDialog.description'),
      });

      if (confirm !== false && onDeleteAttachment) {
        onDeleteAttachment(imageId);
      }
    },
    [isConfirmed, onDeleteAttachment, t],
  );

  if (!hasAttachments) {
    return null;
  }

  return (
    <div>
      <p className="font-medium">{t('noteAttachments.imageAttachments')}</p>
      {attachments.map((attachment, index) => (
        <div
          key={attachment.id || `${attachment.fileName}-${index}`}
          className="flex flex-wrap justify-between gap-2 border-b border-[--color-black-30] py-6 last:border-b-0"
        >
          <div className="flex gap-4">
            <img
              src={attachment.url}
              alt={attachment.fileName}
              className="h-[70px] w-[70px] cursor-pointer border border-[--color-black-30] object-cover"
              onClick={() => handleOpenImage(index)}
            />
            <div className="flex flex-col justify-center text-sm">
              <p className="my-0 font-medium">{t('noteAttachments.attachmentAdded')}</p>
              <p className="my-0">
                {attachment.createdDate ? stringToDateTime(attachment.createdDate) : '-'}
              </p>
              <div className="flex gap-2">
                <span>{attachment.fileName}</span>
                <span>&ndash;</span>
                <span>{formatSizeToKilobytes(attachment.size)}</span>
              </div>
            </div>
          </div>
          <div>
            <Button
              variant={ButtonVariant.Supplementary}
              iconStart={<IconTrash />}
              onClick={() => handleDeleteAttachment(attachment.id)}
              data-testid={`delete-attachment-${attachment.id}-button`}
            >
              {t('delete')}
            </Button>
            <Button
              variant={ButtonVariant.Supplementary}
              iconStart={<IconEye />}
              onClick={() => handleOpenImage(index)}
            >
              {t('noteAttachments.view')}
            </Button>
          </div>
        </div>
      ))}

      {currentAttachment && (
        <AttachmentSlideshowDialog
          isOpen={isSlideshowOpen}
          attachments={attachments}
          selectedIndex={selectedAttachmentIndex}
          onClose={closeSlideshow}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
        />
      )}
    </div>
  );
}
