import { Paragraph } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { useCallback, useEffect } from 'react';
import ProjectNote from './ProjectNote';
import NewNoteForm from './NewNoteForm';
import { getNotesByProjectThunk, selectNotes } from '@/reducers/noteSlice';
import './styles.css';
import { t } from 'i18next';
import { sortArrayByDates } from '@/utils/common';
import { selectProject } from '@/reducers/projectSlice';

const ProjectNotes = () => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(selectProject)?.id;
  const notes = useAppSelector(selectNotes);

  useEffect(() => {
    if (projectId) dispatch(getNotesByProjectThunk(projectId));
  }, [projectId]);

  const sortedNotes = useCallback(() => sortArrayByDates(notes, 'createdDate', true), [notes]);

  return (
    <div className="notes-page-container">
      <h1 className="text-heading-m">Muistiinpanot</h1>
      <Paragraph size="m" text={t('newNoteInfo')} />
      {/* note form */}
      <NewNoteForm />
      {/* notes (sorted by created) */}
      {sortedNotes()?.map((n) => (
        <ProjectNote key={n.id} note={n} />
      ))}
    </div>
  );
};

export default ProjectNotes;
