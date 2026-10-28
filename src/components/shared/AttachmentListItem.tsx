import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  ButtonSize,
  IconEye,
  IconPhoto,
  IconTrash,
  Link,
} from 'hds-react';
import { useTranslation } from 'react-i18next';
import { formatSizeToKilobytes } from '@/utils/fileUtils';

interface IAttachmentListItemProps {
  attachment: {
    name: string;
    size?: number;
    downloadUrl?: string;
  };
  backgroundColor?: string;
  onView?: () => void;
  onDelete?: () => void;
  deleteButtonDisabled?: boolean;
}

export default function AttachmentListItem({
  attachment,
  backgroundColor = 'var(--color-white)',
  onView,
  onDelete,
  deleteButtonDisabled,
}: Readonly<IAttachmentListItemProps>) {
  const { t } = useTranslation();

  return (
    <div
      className="border-b-coat-of-arms flex items-center justify-between gap-4 border-b-2 border-dotted p-[var(--spacing-xs)]"
      style={{ backgroundColor }}
    >
      <div className="flex items-center gap-2">
        <IconPhoto aria-hidden="true" />
        <div className="flex max-w-3xs flex-wrap">
          <div className="truncate" title={attachment.name}>
            {attachment.downloadUrl ? (
              <Link href={attachment.downloadUrl} download={attachment.name}>
                {attachment.name}
              </Link>
            ) : (
              attachment.name
            )}
          </div>
          <span>
            {attachment.size !== undefined && ` (${formatSizeToKilobytes(attachment.size)})`}
          </span>
        </div>
      </div>
      <div>
        {onView && (
          <Button
            variant={ButtonVariant.Supplementary}
            theme={ButtonPresetTheme.Black}
            size={ButtonSize.Small}
            iconStart={<IconEye />}
            onClick={onView}
          >
            {t('attachments.view')}
          </Button>
        )}
        {onDelete && (
          <Button
            variant={ButtonVariant.Supplementary}
            theme={ButtonPresetTheme.Black}
            size={ButtonSize.Small}
            iconStart={<IconTrash />}
            onClick={onDelete}
            disabled={deleteButtonDisabled}
          >
            {t('attachments.delete')}
          </Button>
        )}
      </div>
    </div>
  );
}
