import AttachmentPreviewDialog from '@/components/shared/AttachmentPreviewDialog';
import { FC, memo } from 'react';

interface IAttachmentSlideshowDialogProps {
  isOpen: boolean;
  attachments: {
    fileName: string;
    downloadUrl?: string;
  }[];
  selectedIndex: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const AttachmentSlideshowDialog: FC<IAttachmentSlideshowDialogProps> = ({
  isOpen,
  attachments,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  const currentAttachment = attachments[selectedIndex];

  if (!currentAttachment) {
    return null;
  }

  return (
    <AttachmentPreviewDialog
      id="attachment-slideshow-dialog"
      isOpen={isOpen}
      onClose={onClose}
      image={currentAttachment}
      navigation={
        attachments.length > 1
          ? {
              selectedIndex,
              count: attachments.length,
              onPrevious,
              onNext,
            }
          : undefined
      }
    />
  );
};

export default memo(AttachmentSlideshowDialog);
