import { Paragraph, Title } from '@/components/shared';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { getNotesByProjectCardThunk } from '@/reducers/projectCardSlice';
import { RootState } from '@/store';
import { Button } from 'hds-react/components/Button';
import { TextArea } from 'hds-react/components/Textarea';
import { useEffect } from 'react';
import ProjectCardNote from './ProjectCardNote';
import _ from 'lodash';
import './styles.css';

const ProjectCardNotes = () => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(
    (state: RootState) => state.projectCard.selectedProjectCard?.id,
    _.isEqual,
  );
  const notes = useAppSelector((state: RootState) => state.projectCard.notes, _.isEqual);

  useEffect(() => {
    if (projectId) dispatch(getNotesByProjectCardThunk(projectId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="notes-page-container">
      <Title size="m" text="notes" />
      <Paragraph size="m" text="Tallenna hankkeeseen liittyvät muistiinpanot tähän" />
      {/* note form */}
      <div className="note-form-container">
        <div className="note-form-textarea">
          <TextArea id="textarea" label="Kirjoita muistiinpano" />
        </div>
        <Button>Tallenna</Button>
      </div>
      <div>
        {notes?.map((n) => (
          <ProjectCardNote key={n.id} />
        ))}
      </div>
    </div>
  );
};

export default ProjectCardNotes;
