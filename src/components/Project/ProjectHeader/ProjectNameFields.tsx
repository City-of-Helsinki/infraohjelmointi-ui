import { HookFormControlType } from '@/interfaces/formInterfaces';
import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { t } from 'i18next';
import { FC, MouseEvent, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconButton } from '../../shared';

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
    <div className="mb-6 flex justify-between">
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
                  className="w-80"
                  placeholder={t('name') || ''}
                  aria-label="project-name"
                />
                <br />
              </>
            ) : (
              <h3 className="text-heading-m text-white">{field.value}</h3>
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
              <p className="text-white">{field.value}</p>
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
