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
  return (
    <AttachmentPreviewDialog
      id="attachment-slideshow-dialog"
      isOpen={isOpen}
      onClose={onClose}
      image={attachments[selectedIndex]}
      navigation={{
        selectedIndex,
        count: attachments.length,
        onPrevious,
        onNext,
      }}
    />
  );
};

export default memo(AttachmentSlideshowDialog);
