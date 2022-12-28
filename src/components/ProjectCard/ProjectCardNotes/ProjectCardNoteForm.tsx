import { Button } from 'hds-react/components/Button';
import { TextArea } from 'hds-react/components/Textarea';

const ProjectCardNoteForm = () => (
  <div className="note-form-container">
    <div className="note-form-textarea">
      <TextArea id="textarea" label="Kirjoita muistiinpano" />
    </div>
    <Button>Tallenna</Button>
  </div>
);

export default ProjectCardNoteForm;
