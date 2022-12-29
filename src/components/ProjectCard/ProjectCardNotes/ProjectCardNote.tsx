import { FormFieldLabel, Span } from '@/components/shared';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { Button } from 'hds-react/components/Button';
import { IconAngleDown, IconAngleUp, IconPenLine, IconTrash } from 'hds-react/icons';
import { INote } from '@/interfaces/noteInterfaces';
import { FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCardDeleteNoteForm from './ProjectCardDeleteNoteForm';
import ProjectCardEditNoteForm from './ProjectCardEditNoteForm';
import ProjectCardNotesEditInfo from './ProjectCardNotesEditInfo';

interface IProjectCardNoteProps {
  note: INote;
}

const ProjectCardNote: FC<IProjectCardNoteProps> = ({ note }) => {
  const { t } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openModifiedInfo, setOpenModifiedInfo] = useState(false);

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

  return (
    <div className="note-container">
      <div className="note-header-container">
        <div>
          {/* TODO: get updated date and author from BE */}
          <Span text={'23.11.2022 8:05'} size="s" fontWeight="light" />
          <FormFieldLabel text="Mikko Mallikas" />
        </div>
        {/* TODO: modify note label should only display when the note is modified */}
        <div>
          <StatusLabel type="alert">{t('modified')}</StatusLabel>
        </div>
      </div>
      <div className="note-content-container">
        <p>{note.content}</p>
      </div>
      <div className="note-footer-container">
        <Button
          size="small"
          variant="supplementary"
          iconRight={openModifiedInfo ? <IconAngleUp /> : <IconAngleDown />}
          onClick={handleOpenModifiedInfo}
        >
          {t('modificationHistory')}
        </Button>
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
      {openModifiedInfo && <ProjectCardNotesEditInfo />}
      <ProjectCardDeleteNoteForm
        isOpen={openDeleteDialog}
        close={handleOpenDeleteDialog}
        noteId={note.id}
      />
      <ProjectCardEditNoteForm isOpen={openEditDialog} close={handleOpenEditDialog} note={note} />
    </div>
  );
};

export default memo(ProjectCardNote);
