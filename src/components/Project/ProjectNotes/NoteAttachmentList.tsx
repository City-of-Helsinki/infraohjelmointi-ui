import { INoteAttachment } from '@/interfaces/noteInterfaces';
import { stringToDateTime } from '@/utils/dates';
import { Button, ButtonVariant, IconEye } from 'hds-react';
import { useCallback, useMemo, useState } from 'react';
import AttachmentSlideshowDialog from './AttachmentSlideshowDialog';
import { useTranslation } from 'react-i18next';

interface INoteAttachmentListProps {
  attachments: INoteAttachment[];
}

export default function NoteAttachmentList({ attachments }: INoteAttachmentListProps) {
  const { t } = useTranslation();
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

  if (!hasAttachments) {
    return null;
  }

  return (
    <div>
      <p className="font-medium">{t('noteAttachments.imageAttachments')}</p>
      {attachments.map((attachment, index) => (
        <div
          key={attachment.id || `${attachment.name}-${index}`}
          className="flex flex-wrap justify-between gap-2 border-b border-[--color-black-30] py-6 last:border-b-0"
        >
          <div className="flex gap-4">
            <img
              src={attachment.src}
              alt={attachment.name}
              className="h-[70px] w-[70px] border border-[--color-black-30] object-cover"
            />
            <div className="flex flex-col justify-center text-sm">
              <p className="my-0 font-medium">{t('noteAttachments.attachmentAdded')}</p>
              <p className="my-0">
                {attachment.createdDate ? stringToDateTime(attachment.createdDate) : '-'}
              </p>
              <div className="flex gap-2">
                <span>{attachment.name}</span>
                <span>&ndash;</span>
                <span>{attachment.size || '-'}</span>
              </div>
            </div>
          </div>
          <Button
            variant={ButtonVariant.Supplementary}
            iconStart={<IconEye />}
            onClick={() => handleOpenImage(index)}
          >
            {t('noteAttachments.view')}
          </Button>
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
