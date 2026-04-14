import { useCallback } from 'react';
import ProjectNote from './ProjectNote';
import NewNoteForm from './NewNoteForm';
import './styles.css';
import { t } from 'i18next';
import { sortArrayByDates } from '@/utils/dates';
import { useGetNotesByProjectQuery } from '@/api/notesApi';
import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';

const ProjectNotes = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: notes = [] } = useGetNotesByProjectQuery(projectId ?? skipToken);

  const sortedNotes = useCallback(() => sortArrayByDates(notes, 'createdDate', true), [notes]);

  return (
    <div className="notes-page" data-testid="notes-page">
      <h1 className="text-heading-m">Muistiinpanot</h1>
      <p>{t('newNoteInfo')}</p>
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
