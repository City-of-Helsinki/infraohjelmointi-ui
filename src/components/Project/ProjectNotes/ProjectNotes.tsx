import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { useCallback, useEffect } from 'react';
import ProjectNote from './ProjectNote';
import NewNoteForm from './NewNoteForm';
import { getNotesByProjectThunk, selectNotes } from '@/reducers/noteSlice';
import './styles.css';
import { t } from 'i18next';
import { selectProject } from '@/reducers/projectSlice';
import { sortArrayByDates } from '@/utils/dates';

interface ProjectNotesProps {
  getIsDirty?: (isDirty: boolean) => void;
};

const ProjectNotes = ({getIsDirty}: ProjectNotesProps) => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(selectProject)?.id;
  const notes = useAppSelector(selectNotes);

  useEffect(() => {
    if (projectId) dispatch(getNotesByProjectThunk(projectId));
  }, [projectId]);

  const sortedNotes = useCallback(() => sortArrayByDates(notes, 'createdDate', true), [notes]);

  return (
    <div className="notes-page" data-testid="notes-page">
      <h1 className="text-heading-m">Muistiinpanot</h1>
      <p>{t('newNoteInfo')}</p>
      {/* note form */}
      <NewNoteForm getIsDirty={getIsDirty}/>
      {/* notes (sorted by created) */}
      {sortedNotes()?.map((n) => (
        <ProjectNote key={n.id} note={n} />
      ))}
    </div>
  );
};

export default ProjectNotes;
