import { useState } from 'react';
import { FormSectionTitle } from '@/components/shared';
import { useFormContext } from 'react-hook-form';
import { validateRequired } from '@/utils/validation';
import { useTranslation } from 'react-i18next';
import LinkField from '@/components/shared/LinkField';
import FileInput from '@/components/shared/FileInput';
import { IConstructionHandoverForm } from '@/interfaces/formInterfaces';
import { IConstructionHandoverAttachment } from '@/interfaces/constructionHandoverInterfaces';
import AttachmentListItem from '@/components/shared/AttachmentListItem';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import AttachmentSlideshowDialog from '@/components/shared/AttachmentSlideshowDialog';
import { getFieldProps } from './ConstructionHandoverForm';

interface IAttachmentsAndLinksSectionProps {
  isPostingAttachment: boolean;
  attachments: IConstructionHandoverAttachment[];
  onDeleteAttachment: (attachment: IConstructionHandoverAttachment) => void;
  isHandoverLocked: boolean;
}

export default function AttachmentsAndLinksSection({
  isHandoverLocked,
  isPostingAttachment,
  attachments,
  onDeleteAttachment,
}: Readonly<IAttachmentsAndLinksSectionProps>) {
  const { t } = useTranslation();
  const { setValue } = useFormContext<IConstructionHandoverForm>();
  const { isConfirmed } = useConfirmDialog();
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  function handleOpenImage(index: number) {
    setSelectedIndex(index);
    setIsSlideshowOpen(true);
  }

  function closeSlideshow() {
    setIsSlideshowOpen(false);
  }

  function handleNextImage() {
    setSelectedIndex((current) => (current + 1) % attachments.length);
  }

  function handlePreviousImage() {
    setSelectedIndex((current) => (current - 1 + attachments.length) % attachments.length);
  }

  async function handleDeleteAttachment(attachment: IConstructionHandoverAttachment) {
    const confirm = await isConfirmed({
      dialogType: 'delete',
      confirmButtonText: t('attachments.deleteDialog.delete'),
      title: t('attachments.deleteDialog.title'),
      description: t('attachments.deleteDialog.description'),
    });
    if (confirm) {
      onDeleteAttachment(attachment);
    }
  }

  return (
    <div className="mb-20">
      <FormSectionTitle
        label="constructionHandoverForm.attachmentsAndLinks"
        name="attachmentsAndLinks"
      />
      <LinkField
        {...getFieldProps('linkDesignDrawings')}
        rules={{ ...validateRequired('linkDesignDrawings', t) }}
      />
      <LinkField
        {...getFieldProps('linkCostAllocation')}
        rules={{ ...validateRequired('linkCostAllocation', t) }}
      />
      <LinkField
        {...getFieldProps('linkContractBoundaries')}
        rules={{ ...validateRequired('linkContractBoundaries', t) }}
      />
      {!isPostingAttachment && (
        <FileInput
          id="attachments-and-links-file-input"
          handleChange={(files) => {
            setValue('attachments', files);
          }}
          disabled={isHandoverLocked}
        />
      )}
      {attachments.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          <h4 className="heading-s">{t('attachments.attachments')}</h4>
          {attachments.map((attachment, index) => (
            <AttachmentListItem
              key={attachment.id}
              attachment={{
                name: attachment.originalName,
                size: attachment.size,
                downloadUrl: attachment.objectUrl,
              }}
              backgroundColor="var(--color-info-light)"
              onView={() => handleOpenImage(index)}
              onDelete={() => handleDeleteAttachment(attachment)}
              deleteButtonDisabled={isHandoverLocked}
            />
          ))}
        </div>
      )}
      {attachments[selectedIndex] && (
        <AttachmentSlideshowDialog
          isOpen={isSlideshowOpen}
          attachments={attachments.map((attachment) => ({
            downloadUrl: attachment.objectUrl,
            fileName: attachment.originalName,
          }))}
          selectedIndex={selectedIndex}
          onClose={closeSlideshow}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
        />
      )}
    </div>
  );
}
