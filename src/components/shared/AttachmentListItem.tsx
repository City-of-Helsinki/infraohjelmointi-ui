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
      className="flex items-center justify-between gap-4 border-b-2 border-dotted border-b-coat-of-arms p-[var(--spacing-xs)]"
      style={{ backgroundColor }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <IconPhoto aria-hidden="true" />
        <span className="truncate">
          {attachment.downloadUrl ? (
            <Link href={attachment.downloadUrl} download={attachment.name}>
              {attachment.name}
            </Link>
          ) : (
            attachment.name
          )}
          {attachment.size !== undefined && ` (${formatSizeToKilobytes(attachment.size)})`}
        </span>
      </div>
      <div>
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
      </div>
    </div>
  );
}
