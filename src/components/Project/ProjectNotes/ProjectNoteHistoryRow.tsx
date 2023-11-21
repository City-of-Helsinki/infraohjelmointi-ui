import { INoteHistory } from '@/interfaces/noteInterfaces';
import { stringToDateTime } from '@/utils/dates';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

interface IProjectNoteHistoryRowProps {
  history: INoteHistory;
}

const ProjectNoteHistoryRow: FC<IProjectNoteHistoryRowProps> = ({ history }) => {
  const { t } = useTranslation();
  const author = `${history.updatedBy?.first_name} ${history.updatedBy?.last_name}`;
  return (
    <div className="note-history">
      <div className="note-history-container">
        <div id="modifiedDate">
          <span className="text-sm font-light">{stringToDateTime(history.updatedDate)}</span>
        </div>
        <div id="title">
          <span className="font-bold">{t('noteModified')}</span>
        </div>
        <div id="modifiedBy">
          <span className="font-light">{author}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectNoteHistoryRow);
