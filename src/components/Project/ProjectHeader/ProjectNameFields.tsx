import { HookFormControlType } from '@/interfaces/formInterfaces';
import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { t } from 'i18next';
import { FC, MouseEvent, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconButton, Paragraph, Title } from '../../shared';

interface IProjectNameFormProps {
  control: HookFormControlType;
}

const ProjectNameForm: FC<IProjectNameFormProps> = ({ control }) => {
  const [editing, setEditing] = useState(false);

  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditing((currentState) => !currentState);
  }, []);

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
                  placeholder={t('name') || ''}
                  aria-label="project-name"
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
                placeholder={t('address') || ''}
                aria-label="project-address"
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

export default ProjectNameForm;
