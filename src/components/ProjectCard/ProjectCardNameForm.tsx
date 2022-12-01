import { projectCardAddress } from '@/mocks/common';
import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { ChangeEventHandler, FC, useState } from 'react';
import { IconButton, Paragraph, Title } from '../shared';

interface IProjectCardNameFormProps {
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const ProjectCardNameForm: FC<IProjectCardNameFormProps> = ({ name, onChange }) => {
  const [editing, setEditing] = useState(false);
  return (
    <div className="edit-name-form">
      <div>
        {editing ? (
          <TextInput
            className="edit-name-input"
            id="textinput"
            value={name || ''}
            onChange={onChange}
            required
          />
        ) : (
          <>
            <Title size="m" color="white" text={name} />
            <Paragraph size="m" color="white" text={projectCardAddress} />
          </>
        )}
      </div>
      <IconButton
        onClick={() => setEditing(!editing)}
        icon={IconPenLine}
        color="white"
        label="edit-project-name"
      />
    </div>
  );
};

export default ProjectCardNameForm;
