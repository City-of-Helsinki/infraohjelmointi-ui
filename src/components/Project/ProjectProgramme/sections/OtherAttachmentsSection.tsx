import { FileInput, Notification } from 'hds-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import { Language } from '@/i18n/language';
import type { IProjectProgrammeForm } from '@/interfaces/projectProgrammeInterfaces';
import ProjectProgrammeLinksField from '../ProjectProgrammeLinksField';
import ProjectProgrammeAttachmentList from '../ProjectProgrammeAttachmentList';

export const OTHER_ATTACHMENTS_ACCEPT = '.jpg,.jpeg,.png,.pdf,.doc,.docx';
export const OTHER_ATTACHMENTS_MAX_SIZE = 500 * 1024;

const INFO_ITEM_KEYS = [
  'projectProgrammeForm.otherAttachmentsInfoItems.programmePlans',
  'projectProgrammeForm.otherAttachmentsInfoItems.otherPlans',
  'projectProgrammeForm.otherAttachmentsInfoItems.environtmentPlans',
  'projectProgrammeForm.otherAttachmentsInfoItems.links',
  'projectProgrammeForm.otherAttachmentsInfoItems.oldPlans',
];

function isSameFileList(first: File[], second: File[]) {
  return first.length === second.length && first.every((file, index) => file === second[index]);
}

interface IOtherAttachmentsSectionProps {
  projectProgrammeId: string;
  saveError?: string | null;
}

function OtherAttachmentsSection({
  projectProgrammeId,
  saveError,
}: Readonly<IOtherAttachmentsSectionProps>) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { control, setValue } = useFormContext<IProjectProgrammeForm>();
  const watchedNewFiles = useWatch({ control, name: 'otherAttachments.newFiles' });
  const newFiles = watchedNewFiles ?? [];
  const reportedFilesRef = useRef<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  // HDS FileInput keeps its own file list, so remount it when the form value is reset elsewhere.
  useEffect(() => {
    const files = watchedNewFiles ?? [];
    if (!isSameFileList(files, reportedFilesRef.current)) {
      reportedFilesRef.current = files;
      setFileInputKey((key) => key + 1);
    }
  }, [watchedNewFiles]);

  function handleFilesChange(files: File[]) {
    reportedFilesRef.current = files;
    setValue('otherAttachments.newFiles', files, { shouldDirty: true });
  }

  return (
    <div className="mb-12" data-testid="project-programme-other-attachments-form">
      <FormSectionTitle
        name="projectProgrammeOtherAttachments"
        label="projectProgrammeForm.otherAttachmentsSectionTitle"
      />
      <p className="mb-8">{t('projectProgrammeForm.requiredSectionHelperText')}</p>
      <Notification
        type="info"
        label={t('projectProgrammeForm.otherAttachmentsInfoTitle')}
        className="mb-8"
      >
        <ul className="list-disc pl-6">
          {INFO_ITEM_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </Notification>
      <div className="mb-6 w-full">
        <FileInput
          key={fileInputKey}
          id="project-programme-other-attachments-file-input"
          data-testid="project-programme-other-attachments-file-input"
          label={t('projectProgrammeForm.otherAttachmentsDragAndDrop')}
          buttonLabel={t('projectProgrammeForm.addAttachments')}
          language={language as Language}
          accept={OTHER_ATTACHMENTS_ACCEPT}
          maxSize={OTHER_ATTACHMENTS_MAX_SIZE}
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
          data-testid="project-programme-other-attachments-error"
        >
          {saveError}
        </Notification>
      )}
      {!saveError && newFiles.length > 0 && (
        <Notification
          type="success"
          label={t('projectProgrammeForm.otherAttachmentsSuccessTitle')}
          className="mb-6"
          data-testid="project-programme-other-attachments-success"
        >
          {t('projectProgrammeForm.otherAttachmentsPendingSuccess', { count: newFiles.length })}
        </Notification>
      )}
      <ProjectProgrammeAttachmentList projectProgrammeId={projectProgrammeId} />
      <ProjectProgrammeLinksField section="otherAttachments" />
    </div>
  );
}

export default memo(OtherAttachmentsSection);
