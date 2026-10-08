import { stringToDateTime } from '@/utils/dates';
import { Button, ButtonVariant, IconEye, IconTrash } from 'hds-react';
import { useCallback, useMemo, useState } from 'react';
import AttachmentSlideshowDialog from '../../shared/AttachmentSlideshowDialog';
import { useTranslation } from 'react-i18next';
import { INoteImage } from '@/interfaces/noteInterfaces';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { formatSizeToKilobytes } from '@/utils/fileUtils';
import styles from './NoteAttachmentList.module.css';

interface INoteAttachmentListProps {
  attachments: INoteImage[];
  onDeleteAttachment?: (imageId: string) => void;
}

export default function NoteAttachmentList({
  attachments,
  onDeleteAttachment,
}: Readonly<INoteAttachmentListProps>) {
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
        confirmButtonText: t('attachments.deleteDialog.delete'),
        title: t('attachments.deleteDialog.title'),
        description: t('attachments.deleteDialog.description'),
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
      <p className="font-medium">{t('attachments.imageAttachments')}</p>
      {attachments.map((attachment, index) => (
        <div key={attachment.id || `${attachment.fileName}-${index}`} className={styles.listItem}>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleOpenImage(index)}
              aria-label={t('attachments.viewAttachment', { fileName: attachment.fileName })}
            >
              <img src={attachment.downloadUrl} alt="" className={styles.listItemImage} />
            </button>
            <div className={styles.listItemInfo}>
              <p className="my-0 font-medium">{t('attachments.attachmentAdded')}</p>
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
              {t('attachments.view')}
            </Button>
          </div>
        </div>
      ))}

      {currentAttachment && (
        <AttachmentSlideshowDialog
          isOpen={isSlideshowOpen}
          attachments={attachments.map((attachment) => ({
            downloadUrl: attachment.downloadUrl,
            fileName: attachment.fileName,
          }))}
          selectedIndex={selectedAttachmentIndex}
          onClose={closeSlideshow}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
        />
      )}
    </div>
  );
}
