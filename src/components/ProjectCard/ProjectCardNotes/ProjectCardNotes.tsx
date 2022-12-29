import { Paragraph, Title } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { RootState } from '@/store';
import { useEffect } from 'react';
import ProjectCardNote from './ProjectCardNote';
import ProjectCardNewNoteForm from './ProjectCardNewNoteForm';
import { getNotesByProjectCardThunk } from '@/reducers/noteSlice';
import _ from 'lodash';
import './styles.css';
import { t } from 'i18next';

const ProjectCardNotes = () => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard?.id,
    _.isEqual,
  );
  const notes = useAppSelector((state: RootState) => state.note.notes, _.isEqual);

  useEffect(() => {
    if (projectId) dispatch(getNotesByProjectCardThunk(projectId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="notes-page-container">
      <Title size="m" text="notes" />
      <Paragraph size="m" text={t('newNoteInfo')} />
      {/* note form */}
      <ProjectCardNewNoteForm />
      {/* notes */}
      {notes?.map((n) => (
        <ProjectCardNote key={n.id} note={n} />
      ))}
    </div>
  );
};

export default ProjectCardNotes;
