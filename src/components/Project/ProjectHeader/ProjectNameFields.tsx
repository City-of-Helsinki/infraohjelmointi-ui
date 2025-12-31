import { HookFormControlType } from '@/interfaces/formInterfaces';
import { TextInput } from 'hds-react';
import { IconPenLine } from 'hds-react/icons';
import { FC, MouseEvent, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IconButton } from '../../shared';
import './styles.css';
import { useAppSelector } from '@/hooks/common';
import { selectProjectMode } from '@/reducers/projectSlice';
import { useTranslation } from 'react-i18next';
import { selectUser } from '@/reducers/authSlice';
import { isUserOnlyViewer } from '@/utils/userRoleHelpers';

interface IProjectNameFormProps {
  control: HookFormControlType;
}

const ProjectNameForm: FC<IProjectNameFormProps> = ({ control }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const projectMode = useAppSelector(selectProjectMode);
  const user = useAppSelector(selectUser);
  const isOnlyViewer = isUserOnlyViewer(user);
  const handleSetEditing = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setEditing((currentState) => !currentState);
  }, []);

  return (
    <div className="project-name-form">
      <div>
        {/* Name */}
        <Controller
          name="name"
          control={control as Control<FieldValues>}
          render={({ field }) =>
            editing ? (
              <TextInput
                id={field.name}
                {...field}
                className="mb-[var(--spacing-m)] w-80"
                placeholder={t('name') ?? ''}
                aria-label="project-name"
              />
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
                className="mb-[var(--spacing-m)]"
                placeholder={t('address') ?? ''}
                aria-label="project-address"
              />
            ) : (
              <p className="text-white">{field.value}</p>
            )
          }
        />
        {/* Postal Code */}
        <Controller
          name="postalCode"
          control={control as Control<FieldValues>}
          render={({ field }) =>
            editing ? (
              <TextInput
                id={field.name}
                {...field}
                className="mb-[var(--spacing-m)]"
                placeholder={t('projectForm.postalCode') ?? ''}
                aria-label="project-postal-code"
              />
            ) : (
              <p className="text-white">{field.value}</p>
            )
          }
        />
        {/* City */}
        <Controller
          name="city"
          control={control as Control<FieldValues>}
          render={({ field }) =>
            editing ? (
              <TextInput
                id={field.name}
                {...field}
                placeholder={t('projectForm.city') ?? ''}
                aria-label="project-city"
              />
            ) : (
              <p className="text-white">{field.value}</p>
            )
          }
        />
      </div>
      {!isOnlyViewer && (
        <IconButton
          onClick={handleSetEditing}
          icon={IconPenLine}
          disabled={projectMode === 'new'}
          color="white"
          label="edit-project-name"
        />
      )}
    </div>
  );
};

export default ProjectNameForm;
