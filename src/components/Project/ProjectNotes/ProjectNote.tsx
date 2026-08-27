import { StatusLabel } from 'hds-react';
import { Button, ButtonSize, ButtonVariant } from 'hds-react';
import { IconAngleDown, IconAngleUp, IconPenLine, IconTrash } from 'hds-react/icons';
import { INote } from '@/interfaces/noteInterfaces';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteNoteForm from './DeleteNoteForm';
import EditNoteForm from './EditNoteForm';
import ProjectNoteHistoryRow from './ProjectNoteHistoryRow';
import { sortArrayByDates, stringToDateTime } from '@/utils/dates';
import NoteAttachmentList from './NoteAttachmentList';
import { useGetNoteImagesQuery, useDeleteNoteImageMutation } from '@/api/notesApi';

interface IProjectNoteProps {
  note: INote;
}

const ProjectNote: FC<IProjectNoteProps> = ({ note }) => {
  const { t } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openModifiedInfo, setOpenModifiedInfo] = useState(false);
  const author = `${note.updatedBy?.first_name} ${note.updatedBy?.last_name}`;
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

  const { data: noteImages } = useGetNoteImagesQuery(note.id);
  const [deleteNoteImage] = useDeleteNoteImageMutation();

  return (
    <div className="note-container" data-testid="note-container">
      {/* header */}
      <div className="note-header-container">
        <div className="flex flex-col">
          <span className="mb-1 text-sm font-light">{stringToDateTime(note.createdDate)}</span>
          <p className="font-medium">{author}</p>
        </div>
        <div>{hasHistory && <StatusLabel type="alert">{t('modified')}</StatusLabel>}</div>
      </div>
      {/* content */}
      <div className="px-6 pb-8">
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{note.content}</p>
      </div>
      {/* footer (buttons) */}
      <div className="note-footer">
        <div>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Supplementary}
            iconStart={<IconTrash />}
            onClick={handleOpenDeleteDialog}
          >
            {t('delete')}
          </Button>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Supplementary}
            iconStart={<IconPenLine />}
            onClick={handleOpenEditDialog}
          >
            {t('edit')}
          </Button>
        </div>
      </div>
      {noteImages && noteImages.length > 0 && (
        <div className="pb-8 pl-6 pr-2 pt-8">
          <NoteAttachmentList
            attachments={noteImages ?? []}
            onDeleteAttachment={(imageId) => deleteNoteImage({ noteId: note.id, imageId })}
          />
        </div>
      )}
      {hasHistory && (
        <div className="px-3 pb-4">
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Supplementary}
            iconEnd={openModifiedInfo ? <IconAngleUp /> : <IconAngleDown />}
            onClick={handleOpenModifiedInfo}
          >
            {t('editHistory')}
          </Button>
        </div>
      )}
      {/* history (sorted by updated) */}
      {openModifiedInfo &&
        sortedHistory()?.map((h) => <ProjectNoteHistoryRow key={h.history_id} history={h} />)}
      <DeleteNoteForm isOpen={openDeleteDialog} close={handleOpenDeleteDialog} noteId={note.id} />
      <EditNoteForm isOpen={openEditDialog} close={handleOpenEditDialog} note={note} />
    </div>
  );
};

export default memo(ProjectNote);
