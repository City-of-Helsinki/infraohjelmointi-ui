import { Paragraph, Title } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { useEffect } from 'react';
import ProjectNote from './ProjectNote';
import NewNoteForm from './NewNoteForm';
import { getNotesByProjectThunk } from '@/reducers/noteSlice';
import _ from 'lodash';
import './styles.css';
import { t } from 'i18next';

const ProjectNotes = () => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(
    (state: RootState) => state.project.selectedProject?.id,
    _.isEqual,
  );
  const notes = useAppSelector((state: RootState) => state.note.notes, _.isEqual);

  useEffect(() => {
    if (projectId) dispatch(getNotesByProjectThunk(projectId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="notes-page-container">
      <Title size="m" text="notes" />
      <Paragraph size="m" text={t('newNoteInfo')} />
      {/* note form */}
      <NewNoteForm />
      {/* notes */}
      {notes?.map((n) => (
        <ProjectNote key={n.id} note={n} />
      ))}
    </div>
  );
};

export default ProjectNotes;
