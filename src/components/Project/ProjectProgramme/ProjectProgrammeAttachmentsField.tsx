import { FileInput, Notification } from 'hds-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Language } from '@/i18n/language';
import type { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import { ATTACHMENT_MAX_SIZE } from '@/utils/fileUtils';
import ProjectProgrammeAttachmentList from './ProjectProgrammeAttachmentList';
import { ProjectProgrammeSectionId } from './sections/projectProgrammeSections';

export const OTHER_ATTACHMENTS_ACCEPT = '.jpg,.jpeg,.png,.pdf,.docx';

interface ProjectProgrammeAttachmentsFieldProps {
  section: ProjectProgrammeSectionId;
  projectProgrammeId: string;
  saveError?: string | null;
  showSuccessNotification?: boolean;
}

export default function ProjectProgrammeAttachmentsField({
  section,
  projectProgrammeId,
  saveError,
  showSuccessNotification = false,
}: Readonly<ProjectProgrammeAttachmentsFieldProps>) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { control, setValue } = useFormContext<IProjectProgrammeForm>();
  const watchedNewFiles = useWatch({ control, name: `${section}.newFiles` });
  const newFiles = watchedNewFiles ?? [];
  const reportedFilesRef = useRef<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const fieldId = section === 'otherAttachments' ? 'other-attachments' : section;

  useEffect(() => {
    const files = watchedNewFiles ?? [];
    if (
      files.length !== reportedFilesRef.current.length ||
      files.some((file, index) => file !== reportedFilesRef.current[index])
    ) {
      reportedFilesRef.current = files;
      setFileInputKey((key) => key + 1);
    }
  }, [watchedNewFiles]);

  function handleFilesChange(files: File[]) {
    reportedFilesRef.current = files;
    setValue(`${section}.newFiles`, files, { shouldDirty: true });
  }

  return (
    <>
      <div className="mb-6 w-full">
        <FileInput
          key={fileInputKey}
          id={`project-programme-${fieldId}-file-input`}
          data-testid={`project-programme-${fieldId}-file-input`}
          label={t('projectProgrammeForm.otherAttachmentsDragAndDrop')}
          buttonLabel={t('projectProgrammeForm.addAttachments')}
          language={language as Language}
          accept={OTHER_ATTACHMENTS_ACCEPT}
          maxSize={ATTACHMENT_MAX_SIZE}
          defaultValue={newFiles.length > 0 ? newFiles : undefined}
          onChange={handleFilesChange}
          dragAndDrop
          multiple
        />
      </div>
      {saveError && (
        <Notification
          type="error"
          label={t('projectProgrammeForm.otherAttachmentsErrorTitle')}
          className="mb-6"
          data-testid={`project-programme-${fieldId}-error`}
        >
          {saveError}
        </Notification>
      )}
      {showSuccessNotification && !saveError && newFiles.length > 0 && (
        <Notification
          type="success"
          label={t('projectProgrammeForm.otherAttachmentsSuccessTitle')}
          className="mb-6"
          data-testid={`project-programme-${fieldId}-success`}
        >
          {t('projectProgrammeForm.otherAttachmentsPendingSuccess', { count: newFiles.length })}
        </Notification>
      )}
      <ProjectProgrammeAttachmentList projectProgrammeId={projectProgrammeId} section={section} />
    </>
  );
}
