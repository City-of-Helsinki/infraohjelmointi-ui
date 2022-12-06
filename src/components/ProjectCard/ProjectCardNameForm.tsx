import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { ChangeEventHandler, FC, useState } from 'react';
import { IconButton, Paragraph, Title } from '../shared';

interface IProjectCardNameFormProps {
  name: string;
  address?: string;
  onNameChange: ChangeEventHandler<HTMLInputElement>;
  onAddressChange: ChangeEventHandler<HTMLInputElement>;
}

const ProjectCardNameForm: FC<IProjectCardNameFormProps> = ({
  name,
  address,
  onNameChange,
  onAddressChange,
}) => {
  const [editing, setEditing] = useState(false);
  return (
    <div className="edit-name-form">
      <div>
        {editing ? (
          <>
            <TextInput
              className="edit-name-input"
              id="name"
              value={name || ''}
              onChange={onNameChange}
              placeholder={'Nimi'}
              aria-label="project-card-name"
            />
            <br />
            <TextInput
              className="edit-address-input"
              id="address"
              value={address || ''}
              onChange={onAddressChange}
              placeholder={'Osoite'}
              aria-label="project-card-address"
            />
          </>
        ) : (
          <>
            <Title size="m" color="white" text={name} />
            <Paragraph size="m" color="white" text={address || ''} />
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
