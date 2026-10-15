import { Button, ButtonVariant, Dialog } from 'hds-react';
import { IconAngleLeft, IconAngleRight, IconCross } from 'hds-react/icons';
import { memo, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface IAttachmentPreviewDialogProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  image?: {
    downloadUrl?: string;
    fileName: string;
  };
  navigation?: {
    selectedIndex: number;
    count: number;
    onPrevious?: () => void;
    onNext?: () => void;
  };
  children?: ReactNode;
  ariaLabel?: string;
  contentTestId?: string;
}

function AttachmentPreviewDialog({
  id,
  isOpen,
  onClose,
  image,
  navigation,
  children,
  ariaLabel,
  contentTestId,
}: Readonly<IAttachmentPreviewDialogProps>) {
  const { t } = useTranslation();
  const onPrevious = navigation?.onPrevious;
  const onNext = navigation?.onNext;

  useEffect(() => {
    if (!isOpen || (!onPrevious && !onNext)) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrevious?.();
      }

      if (event.key === 'ArrowRight') {
        onNext?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!image && !children) {
    return null;
  }

  return (
    <Dialog
      id={id}
      aria-labelledby={`${id}-title`}
      aria-label={ariaLabel}
      isOpen={isOpen}
      theme={{
        '--accent-line-color': 'var(--color-white)',
      }}
      style={{ maxWidth: '1200px', width: '80vw' }}
      close={onClose}
      closeButtonLabelText={t('attachmentSlideshowDialog.close')}
    >
      <Dialog.Content style={{ padding: '14px 24px 24px', position: 'relative' }}>
        {ariaLabel && (
          <span id={`${id}-title`} className="sr-only">
            {ariaLabel}
          </span>
        )}
        <div className="flex flex-col items-center" data-testid={contentTestId}>
          {image ? (
            <img
              src={image.downloadUrl}
              alt={image.fileName}
              className="max-h-[70vh] w-full rounded-sm object-contain"
            />
          ) : (
            children
          )}
          {navigation && (
            <div className="absolute bottom-8 flex items-center gap-4 bg-white px-4 py-1">
              <button
                type="button"
                onClick={onPrevious}
                disabled={navigation.count < 2}
                className="focus:outline-[var(--color-coat-of-arms)]"
                aria-label={t('attachmentSlideshowDialog.previousImage')}
              >
                <IconAngleLeft />
              </button>
              <p className="text-sm">
                {navigation.selectedIndex + 1} / {navigation.count}
              </p>
              <button
                type="button"
                onClick={onNext}
                disabled={navigation.count < 2}
                className="focus:outline-[var(--color-coat-of-arms)]"
                aria-label={t('attachmentSlideshowDialog.nextImage')}
              >
                <IconAngleRight />
              </button>
            </div>
          )}
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
}

export default memo(AttachmentPreviewDialog);
