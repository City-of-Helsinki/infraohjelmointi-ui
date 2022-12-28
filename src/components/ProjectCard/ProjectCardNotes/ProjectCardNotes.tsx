import { Paragraph, Title } from '@/components/shared';
import { Button } from 'hds-react/components/Button';
import { TextArea } from 'hds-react/components/Textarea';

const ProjectCardNotes = () => {
  return (
    <div style={{ margin: 'var(--spacing-layout-l) var(--spacing-layout-xl)' }}>
      <Title size="m" text="notes" />
      <Paragraph size="m" text="Tallenna hankkeeseen liittyvät muistiinpanot tähän" />

      {/* note form */}
      <div
        style={{
          border: '0.125rem solid rgb(204, 204, 204)',
          width: '70%',
          maxWidth: '40rem',
          padding: 'var(--spacing-m)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          margin: 'var(--spacing-m) 0',
        }}
      >
        <div style={{ width: '100%', margin: '0 0 var(--spacing-m) 0' }}>
          <TextArea id="textarea" label="Kirjoita muistiinpano" placeholder="Placeholder" />
        </div>
        <Button>Tallenna</Button>
      </div>
    </div>
  );
};

export default ProjectCardNotes;
