import { Notification } from 'hds-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSectionTitle } from '@/components/shared';
import ProjectProgrammeLinksField from '../ProjectProgrammeLinksField';
import ProjectProgrammeAttachmentsField from '../ProjectProgrammeAttachmentsField';

export { OTHER_ATTACHMENTS_ACCEPT } from '../ProjectProgrammeAttachmentsField';

const INFO_ITEM_KEYS = [
  'projectProgrammeForm.otherAttachmentsInfoItems.programmePlans',
  'projectProgrammeForm.otherAttachmentsInfoItems.otherPlans',
  'projectProgrammeForm.otherAttachmentsInfoItems.environtmentPlans',
  'projectProgrammeForm.otherAttachmentsInfoItems.links',
  'projectProgrammeForm.otherAttachmentsInfoItems.oldPlans',
];

interface IOtherAttachmentsSectionProps {
  projectProgrammeId: string;
  saveError?: string | null;
}

function OtherAttachmentsSection({
  projectProgrammeId,
  saveError,
}: Readonly<IOtherAttachmentsSectionProps>) {
  const { t } = useTranslation();

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
      <ProjectProgrammeAttachmentsField
        section="otherAttachments"
        projectProgrammeId={projectProgrammeId}
        saveError={saveError}
        showSuccessNotification
      />
      <ProjectProgrammeLinksField section="otherAttachments" />
    </div>
  );
}

export default memo(OtherAttachmentsSection);
