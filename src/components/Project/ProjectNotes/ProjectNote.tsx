import { FormFieldLabel } from '@/components/shared';
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

  return (
    <div className="note-container" data-testid="note-container">
      {/* header */}
      <div className="note-header-container">
        <div className="flex flex-col">
          <span className="mb-1 text-sm font-light">{stringToDateTime(note.createdDate)}</span>
          <FormFieldLabel text={author} />
        </div>
        <div>{hasHistory && <StatusLabel type="alert">{t('modified')}</StatusLabel>}</div>
      </div>
      {/* content */}
      <div className="px-6 pb-8">
        <p className="whitespace-pre-wrap">{note.content}</p>
      </div>
      {/* footer (buttons) */}
      <div className="note-footer">
        <div>
          {hasHistory && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Supplementary}
              iconEnd={openModifiedInfo ? <IconAngleUp /> : <IconAngleDown />}
              onClick={handleOpenModifiedInfo}
            >
              {t('editHistory')}
            </Button>
          )}
        </div>
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
      {/* history (sorted by updated) */}
      {openModifiedInfo &&
        sortedHistory()?.map((h) => <ProjectNoteHistoryRow key={h.history_id} history={h} />)}
      <DeleteNoteForm isOpen={openDeleteDialog} close={handleOpenDeleteDialog} noteId={note.id} />
      <EditNoteForm isOpen={openEditDialog} close={handleOpenEditDialog} note={note} />
    </div>
  );
};

export default memo(ProjectNote);
