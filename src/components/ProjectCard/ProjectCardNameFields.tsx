import { HookFormControlType } from '@/interfaces/formInterfaces';
import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEvent, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconButton, Paragraph, Title } from '../shared';

interface IProjectCardNameFormProps {
  control: HookFormControlType;
}

const ProjectCardNameForm: FC<IProjectCardNameFormProps> = ({ control }) => {
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
          render={({ field }) =>
            editing ? (
              <>
                <TextInput
                  id={field.name}
                  {...field}
                  className="edit-name-input"
                  placeholder={'Nimi'}
                  aria-label="project-card-name"
                />
                <br />
              </>
            ) : (
              <Title size="m" color="white" text={field.value} />
            )
          }
        />
        {/* Address */}
        <Controller
          name="address"
          control={control as Control<FieldValues>}
          render={({ field }) =>
            editing ? (
              <TextInput
                id={field.name}
                {...field}
                className="edit-address-input"
                placeholder={'Osoite'}
                aria-label="project-card-address"
              />
            ) : (
              <Paragraph size="m" color="white" text={field.value} />
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
