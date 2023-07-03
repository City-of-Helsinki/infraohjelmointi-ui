import { HookFormControlType } from '@/interfaces/formInterfaces';
import { TextInput } from 'hds-react/components/TextInput';
import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEvent, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconButton } from '../../shared';
import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { selectMode } from '@/reducers/projectSlice';
import { useTranslation } from 'react-i18next';

interface IProjectNameFormProps {
  control: HookFormControlType;
}

const ProjectNameForm: FC<IProjectNameFormProps> = ({ control }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const projectMode = useAppSelector(selectMode);
  const handleSetEditing = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (projectMode === 'edit') {
        setEditing((currentState) => !currentState);
      }
    },
    [projectMode],
  );

  return (
    <div className="project-name-form">
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
                  placeholder={t('name') ?? ''}
                  aria-label="project-name"
                />
                <br />
              </>
            ) : (
              <h3 className="text-heading-m text-white">
                {projectMode === 'new' ? t(`newProject`) : field.value}
              </h3>
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
                placeholder={t('address') ?? ''}
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
