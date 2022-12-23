import { HookFormControlType } from '@/interfaces/formInterfaces';
import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEvent, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconButton, Paragraph, Title } from '../shared';

interface IProjectCardNameFormProps {
  control: HookFormControlType;
  handleSave: any;
}

const ProjectCardNameForm: FC<IProjectCardNameFormProps> = ({ control, handleSave }) => {
  const [editing, setEditing] = useState(false);
  const handleSetEditing = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing(!editing);
  };
  return (
    <div className="edit-name-form">
      <div>
        {/* Name */}
        <Controller
          name="name"
          control={control as Control<FieldValues>}
          render={({ field: { name, onChange, value, onBlur }, fieldState: { isDirty } }) =>
            editing ? (
              <>
                <TextInput
                  id={name}
                  value={value}
                  onChange={onChange}
                  onBlur={isDirty ? handleSave : onBlur}
                  className="edit-name-input"
                  placeholder={'Nimi'}
                  aria-label="project-card-name"
                />
                <br />
              </>
            ) : (
              <Title size="m" color="white" text={value} />
            )
          }
        />
        {/* Address */}
        <Controller
          name="address"
          control={control as Control<FieldValues>}
          render={({ field: { name, onChange, value, onBlur }, fieldState: { isDirty } }) =>
            editing ? (
              <TextInput
                id={name}
                onChange={onChange}
                value={value}
                onBlur={isDirty ? handleSave : onBlur}
                className="edit-address-input"
                placeholder={'Osoite'}
                aria-label="project-card-address"
              />
            ) : (
              <Paragraph size="m" color="white" text={value} />
            )
          }
        />
      </div>
      <IconButton
        onClick={handleSetEditing}
        icon={IconPenLine}
        color="white"
        label="edit-project-name"
      />
    </div>
  );
};

export default ProjectCardNameForm;
