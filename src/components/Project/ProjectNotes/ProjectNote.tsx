import { FormFieldLabel, Span } from '@/components/shared';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { Button } from 'hds-react/components/Button';
import { IconAngleDown, IconAngleUp, IconPenLine, IconTrash } from 'hds-react/icons';
import { INote } from '@/interfaces/noteInterfaces';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteNoteForm from './DeleteNoteForm';
import EditNoteForm from './EditNoteForm';
import ProjectNoteHistoryRow from './ProjectNoteHistoryRow';
import { sortArrayByDates, stringToDateTime } from '@/utils/common';

interface IProjectNoteProps {
  note: INote;
}

const ProjectNote: FC<IProjectNoteProps> = ({ note }) => {
  const { t } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openModifiedInfo, setOpenModifiedInfo] = useState(false);
  const author = `${note.updatedBy.firstName} ${note.updatedBy.lastName}`;
  const hasHistory = note.history?.length > 0;

  const handleOpenDeleteDialog = useCallback(
    () => setOpenDeleteDialog((currentState) => !currentState),
    [],
  );

  const handleOpenEditDialog = useCallback(
    () => setOpenEditDialog((currentState) => !currentState),
    [],
  );

  const handleOpenModifiedInfo = useCallback(
    () => setOpenModifiedInfo((currentState) => !currentState),
    [],
  );

  const sortedHistory = useCallback(
    () => sortArrayByDates(note.history, 'updatedDate', true),
    [note.history],
  );

  return (
    <div className="note-container">
      {/* header */}
      <div className="note-header-container">
        <div>
          <Span text={stringToDateTime(note.createdDate)} size="s" fontWeight="light" />
          <FormFieldLabel text={author} />
        </div>
        <div>{hasHistory && <StatusLabel type="alert">{t('modified')}</StatusLabel>}</div>
      </div>
      {/* content */}
      <div className="note-content-container">
        <p>{note.content}</p>
      </div>
      {/* footer (buttons) */}
      <div className="note-footer-container">
        <div>
          {hasHistory && (
            <Button
              size="small"
              variant="supplementary"
              iconRight={openModifiedInfo ? <IconAngleUp /> : <IconAngleDown />}
              onClick={handleOpenModifiedInfo}
            >
              {t('modificationHistory')}
            </Button>
          )}
        </div>
        <div>
          <Button
            size="small"
            variant="supplementary"
            iconLeft={<IconTrash />}
            onClick={handleOpenDeleteDialog}
          >
            {t('delete')}
          </Button>
          <Button
            size="small"
            variant="supplementary"
            iconLeft={<IconPenLine />}
            onClick={handleOpenEditDialog}
          >
            {t('modify')}
          </Button>
        </div>
      </div>
      {/* history (sorted by updated) */}
      {openModifiedInfo &&
        sortedHistory()?.map((h) => <ProjectNoteHistoryRow key={h.history_id} history={h} />)}
      <DeleteNoteForm isOpen={openDeleteDialog} close={handleOpenDeleteDialog} noteId={note.id} />
      <EditNoteForm isOpen={openEditDialog} close={handleOpenEditDialog} note={note} />
    </div>
  );
};

export default memo(ProjectNote);
