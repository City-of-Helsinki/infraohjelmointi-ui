import { Span } from '@/components/shared';
import { useTranslation } from 'react-i18next';

const ProjectNotesEditInfo = () => {
  const { t } = useTranslation();

  /* TODO: modified date and author */
  return (
    <div className="note-edit-info-container">
      <div id="modifiedDate">
        <Span text="23.11.2022 8:05" size="m" fontWeight="light" />
      </div>
      <div id="title">
        <Span text={t('noteModified')} size="m" fontWeight="bold" />
      </div>
      <div id="modifiedBy">
        <Span text="Mikko mallikas" size="m" fontWeight="light" />
      </div>
    </div>
  );
};

export default ProjectNotesEditInfo;
