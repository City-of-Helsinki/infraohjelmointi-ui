import { Span } from '@/components/shared';
import { INoteHistory } from '@/interfaces/noteInterfaces';
import { stringToDateTime } from '@/utils/common';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface IProjectNoteHistoryRowProps {
  history: INoteHistory;
}

const ProjectNoteHistoryRow: FC<IProjectNoteHistoryRowProps> = ({ history }) => {
  const { t } = useTranslation();
  const author = `${history.updatedBy?.firstName} ${history.updatedBy?.lastName}`;
  return (
    <div className="note-history">
      <div className="note-history-container">
        <div id="modifiedDate">
          <Span text={stringToDateTime(history.updatedDate)} size="s" fontWeight="light" />
        </div>
        <div id="title">
          <Span text={t('noteModified')} size="m" fontWeight="bold" />
        </div>
        <div id="modifiedBy">
          <Span text={author} size="m" fontWeight="light" />
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectNoteHistoryRow);
