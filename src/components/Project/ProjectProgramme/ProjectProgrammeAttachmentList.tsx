import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AttachmentListItem from '@/components/shared/AttachmentListItem';
import { useAppDispatch } from '@/hooks/common';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import type {
  IProjectProgrammeAttachment,
  IProjectProgrammeForm,
} from '@/interfaces/projectProgrammeInterfaces';
import { FormMode } from '@/interfaces/formInterfaces';
import { getDownloadUrl } from '@/utils/fileUtils';
import { ProjectProgrammeSectionId } from './sections/projectProgrammeSections';
import { notifyError } from '@/reducers/notificationSlice';
import ProjectProgrammeAttachmentPreviewDialog, {
  getPreviewKind,
  IAttachmentPreview,
} from './ProjectProgrammeAttachmentPreviewDialog';

interface IProjectProgrammeAttachmentListProps {
  projectProgrammeId?: string;
  mode?: FormMode;
  section?: ProjectProgrammeSectionId;
}

function ProjectProgrammeAttachmentList({
  projectProgrammeId,
  mode = 'edit',
  section = 'otherAttachments',
}: Readonly<IProjectProgrammeAttachmentListProps>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isConfirmed } = useConfirmDialog();
  const { control, setValue } = useFormContext<IProjectProgrammeForm>();
  const attachments = useWatch({ control, name: `${section}.attachments` }) ?? [];
  const removedAttachmentIds = useWatch({ control, name: `${section}.removedAttachmentIds` }) ?? [];
  const [preview, setPreview] = useState<IAttachmentPreview | null>(null);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);

  const visibleAttachments = attachments.filter(
    (attachment) => !removedAttachmentIds.includes(attachment.id),
  );
  const selectedAttachment = visibleAttachments.find(
    (attachment) => attachment.id === selectedAttachmentId,
  );
  const imageAttachments = visibleAttachments.filter(
    (attachment) =>
      attachment.downloadUrl &&
      (getPreviewKind(attachment.contentType ?? '', attachment.originalName) === 'image' ||
        (attachment.id === preview?.id &&
          getPreviewKind(preview.contentType, preview.fileName) === 'image')),
  );

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (!projectProgrammeId || !selectedAttachment?.downloadUrl) {
      setPreview(null);
      return;
    }

    let active = true;
    const attachment = selectedAttachment;
    const downloadUrl = selectedAttachment.downloadUrl;

    async function loadPreview() {
      try {
        const url = await getDownloadUrl(downloadUrl);
        if (!url) {
          throw new Error('Attachment download failed');
        }
        if (active) {
          setPreview({
            id: attachment.id,
            fileName: attachment.originalName,
            contentType: attachment.contentType ?? '',
            url,
          });
        }
      } catch {
        if (active) {
          setSelectedAttachmentId(null);
          dispatch(
            notifyError({
              title: 'loadError',
              message: 'projectProgrammeAttachmentLoadError',
              type: 'toast',
            }),
          );
        }
      }
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, [projectProgrammeId, selectedAttachment, dispatch]);

  const closePreview = useCallback(() => setSelectedAttachmentId(null), []);

  const showAdjacentImage = useCallback(
    (offset: number) => {
      if (imageAttachments.length < 2) {
        return;
      }
      setSelectedAttachmentId((currentId) => {
        const currentIndex = imageAttachments.findIndex(
          (attachment) => attachment.id === currentId,
        );
        return imageAttachments[
          (currentIndex + offset + imageAttachments.length) % imageAttachments.length
        ].id;
      });
    },
    [imageAttachments],
  );
  const showPreviousImage = useCallback(() => showAdjacentImage(-1), [showAdjacentImage]);
  const showNextImage = useCallback(() => showAdjacentImage(1), [showAdjacentImage]);

  async function handleDeleteAttachment(attachment: IProjectProgrammeAttachment) {
    const confirm = await isConfirmed({
      dialogType: 'delete',
      confirmButtonText: t('projectProgrammeForm.deleteAttachmentDialog.delete'),
      title: t('projectProgrammeForm.deleteAttachmentDialog.title'),
      description: t('projectProgrammeForm.deleteAttachmentDialog.description'),
    });

    if (confirm !== false) {
      setValue(`${section}.removedAttachmentIds`, [...removedAttachmentIds, attachment.id], {
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
        <AttachmentListItem
          key={attachment.id}
          attachment={{ name: attachment.originalName }}
          onView={() => setSelectedAttachmentId(attachment.id)}
          onDelete={mode === 'edit' ? () => handleDeleteAttachment(attachment) : undefined}
        />
      ))}
      <ProjectProgrammeAttachmentPreviewDialog
        preview={selectedAttachment ? preview : null}
        onClose={closePreview}
        imageAttachments={imageAttachments}
        onPrevious={showPreviousImage}
        onNext={showNextImage}
      />
    </div>
  );
}

export default ProjectProgrammeAttachmentList;
