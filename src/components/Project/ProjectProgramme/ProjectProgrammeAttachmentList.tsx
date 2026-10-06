import { Button, ButtonVariant, IconEye, IconTrash } from 'hds-react';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getProjectProgrammeAttachmentBlob } from '@/api/projectProgrammeApi';
import { useAppDispatch } from '@/hooks/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import type {
  IProjectProgrammeAttachment,
  IProjectProgrammeForm,
} from '@/interfaces/projectProgrammeInterfaces';
import { FormMode } from '@/interfaces/formInterfaces';
import { notifyError } from '@/reducers/notificationSlice';
import ProjectProgrammeAttachmentPreviewDialog, {
  IAttachmentPreview,
} from './ProjectProgrammeAttachmentPreviewDialog';

interface IProjectProgrammeAttachmentListProps {
  projectProgrammeId?: string;
  mode?: FormMode;
}

function ProjectProgrammeAttachmentList({
  projectProgrammeId,
  mode = 'edit',
}: Readonly<IProjectProgrammeAttachmentListProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isConfirmed } = useConfirmDialog();
  const { control, setValue } = useFormContext<IProjectProgrammeForm>();
  const attachments = useWatch({ control, name: 'otherAttachments.attachments' }) ?? [];
  const removedAttachmentIds =
    useWatch({ control, name: 'otherAttachments.removedAttachmentIds' }) ?? [];
  const [preview, setPreview] = useState<IAttachmentPreview | null>(null);

  const visibleAttachments = attachments.filter(
    (attachment) => !removedAttachmentIds.includes(attachment.id),
  );

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const closePreview = useCallback(() => setPreview(null), []);

  async function handleShowAttachment(attachment: IProjectProgrammeAttachment) {
    if (!projectProgrammeId) return;

    try {
      const blob = await getProjectProgrammeAttachmentBlob(projectProgrammeId, attachment.id);
      setPreview({
        fileName: attachment.originalName,
        contentType: attachment.contentType || blob.type,
        url: URL.createObjectURL(blob),
      });
    } catch {
      dispatch(
        notifyError({
          title: 'loadError',
          message: 'projectProgrammeAttachmentLoadError',
          type: 'toast',
        }),
      );
    }
  }

  async function handleDeleteAttachment(attachment: IProjectProgrammeAttachment) {
    const confirm = await isConfirmed({
      dialogType: 'delete',
      confirmButtonText: t('projectProgrammeForm.deleteAttachmentDialog.delete'),
      title: t('projectProgrammeForm.deleteAttachmentDialog.title'),
      description: t('projectProgrammeForm.deleteAttachmentDialog.description'),
    });

    if (confirm !== false) {
      setValue('otherAttachments.removedAttachmentIds', [...removedAttachmentIds, attachment.id], {
        shouldDirty: true,
      });
    }
  }

  if (visibleAttachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-8" data-testid="project-programme-attachment-list">
      {visibleAttachments.map((attachment) => (
        <div
          key={attachment.id}
          className="mb-2 flex flex-wrap items-center justify-between gap-2 border border-[--color-black-20] bg-[--color-black-5] px-4 py-2"
        >
          <span className="break-all font-medium">{attachment.originalName}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Supplementary}
              iconStart={<IconEye />}
              onClick={() => handleShowAttachment(attachment)}
              aria-label={t('projectProgrammeForm.showAttachmentAriaLabel', {
                fileName: attachment.originalName,
              })}
            >
              {t('projectProgrammeForm.showAttachment')}
            </Button>
            {mode === 'edit' && (
              <Button
                type="button"
                variant={ButtonVariant.Supplementary}
                iconStart={<IconTrash />}
                onClick={() => handleDeleteAttachment(attachment)}
                aria-label={t('projectProgrammeForm.deleteAttachmentAriaLabel', {
                  fileName: attachment.originalName,
                })}
              >
                {t('projectProgrammeForm.deleteAttachment')}
              </Button>
            )}
          </div>
        </div>
      ))}
      <ProjectProgrammeAttachmentPreviewDialog preview={preview} onClose={closePreview} />
    </div>
  );
}

export default ProjectProgrammeAttachmentList;
