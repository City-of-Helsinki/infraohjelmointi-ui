import { Button, ButtonVariant, Dialog } from 'hds-react';
import { IconAngleLeft, IconAngleRight, IconCross } from 'hds-react/icons';
import { FC, memo, useEffect } from 'react';
import { INoteAttachment } from '@/interfaces/noteInterfaces';
import { useTranslation } from 'react-i18next';

interface IAttachmentSlideshowDialogProps {
  isOpen: boolean;
  attachments: INoteAttachment[];
  selectedIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const AttachmentSlideshowDialog: FC<IAttachmentSlideshowDialogProps> = ({
  isOpen,
  attachments,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Add keyboard event listeners for navigation
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrevious();
      }

      if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  const currentAttachment = attachments[selectedIndex];

  if (!currentAttachment) {
    return null;
  }

  return (
    <Dialog
      id="attachment-slideshow-dialog"
      aria-labelledby="attachment-slideshow-dialog-title"
      isOpen={isOpen}
      theme={{
        '--accent-line-color': 'var(--color-white)',
      }}
      style={{ maxWidth: '1200px', width: '80vw' }}
      close={onClose}
      closeButtonLabelText={t('attachmentSlideshowDialog.close')}
    >
      <Dialog.Content style={{ padding: '14px 24px 24px', position: 'relative' }}>
        <div className="flex flex-col items-center">
          <img
            src={currentAttachment.src}
            alt={currentAttachment.name}
            className="max-h-[70vh] w-full rounded-sm object-contain"
          />
          <div className="absolute bottom-8 flex items-center gap-4 bg-white px-4 py-1">
            <button
              onClick={onPrevious}
              disabled={attachments.length < 2}
              className="focus:outline-[var(--color-coat-of-arms)]"
              aria-label={t('attachmentSlideshowDialog.previousImage')}
            >
              <IconAngleLeft />
            </button>
            <p className="text-sm">
              {selectedIndex + 1} / {attachments.length}
            </p>
            <button
              onClick={onNext}
              disabled={attachments.length < 2}
              className="focus:outline-[var(--color-coat-of-arms)]"
              aria-label={t('attachmentSlideshowDialog.nextImage')}
            >
              <IconAngleRight />
            </button>
          </div>
        </div>
        <div className="absolute right-8 top-6">
          <Button
            onClick={onClose}
            variant={ButtonVariant.Secondary}
            iconStart={<IconCross />}
            theme={{
              '--background-color': 'var(--color-white)',
              '--background-color-hover': 'var(--color-white)',
              '--background-color-focus': 'var(--color-white)',
              '--border-color': 'var(--color-white)',
              '--color': 'var(--color-black)',
            }}
          >
            {t('attachmentSlideshowDialog.close')}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default memo(AttachmentSlideshowDialog);
