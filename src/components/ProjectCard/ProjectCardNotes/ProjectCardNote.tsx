import { FormFieldLabel, Span } from '@/components/shared';
import { StatusLabel } from 'hds-react/components/StatusLabel';
import { Button } from 'hds-react/components/Button';
import { IconAngleDown, IconPenLine, IconTrash } from 'hds-react/icons';
import './styles.css';

const ProjectCardNote = () => (
  <div className="note-container">
    <div className="note-header-container">
      <div>
        <Span text={'23.11.2022 8:05'} size="s" fontWeight="light" />
        <FormFieldLabel text="Mikko Mallikas" />
      </div>
      <div>
        <StatusLabel type="alert">Muokattu</StatusLabel>
      </div>
    </div>
    <div className="note-content-container">
      <p>
        {
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In luctus lacus sit amet accumsan dapibus. Curabitur blandit interdum consectetur. Nullam ultrices sem nec placerat convallis. In mollis arcu elementum iaculis facilisis. Morbi porttitor facilisis mauris. Vivamus condimentum viverra sem, a lacinia ex fringilla vel. Nulla tincidunt ante sed lorem molestie vulputate. Mauris interdum venenatis rutrum. Morbi odio dolor, eleifend sed lorem nec, egestas porta est.'
        }
      </p>
    </div>
    <div className="note-footer-container">
      <Button size="small" variant="supplementary" iconRight={<IconAngleDown />}>
        Muokkaushistoria
      </Button>
      <div>
        <Button size="small" variant="supplementary" iconLeft={<IconTrash />}>
          Poista
        </Button>
        <Button size="small" variant="supplementary" iconLeft={<IconPenLine />}>
          Muokkaa
        </Button>
      </div>
    </div>
  </div>
);

export default ProjectCardNote;
