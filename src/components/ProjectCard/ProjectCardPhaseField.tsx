import { useOptions } from '@/hooks/useOptions';
import { Select } from 'hds-react/components/Select';
import { IconFaceSmile } from 'hds-react/icons';
import { FC, useMemo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IProjectCardHeaderFieldProps } from './ProjectCardHeaderForm';

const ProjectCardPhaseField: FC<IProjectCardHeaderFieldProps> = ({ control, handleSave }) => {
  const { t } = useTranslation();
  const icon = useMemo(() => <IconFaceSmile />, []);
  const { options } = useOptions('phase');

  return (
    <Controller
      name="phase"
      control={control as Control<FieldValues>}
      render={({ field: { value, onChange, onBlur }, fieldState: { isDirty } }) => (
        <Select
          label={null}
          value={value}
          icon={icon}
          placeholder={t('projectPhase') || ''}
          onBlur={isDirty ? handleSave : onBlur}
          options={options}
          onChange={onChange}
        />
      )}
    />
  );
};

export default ProjectCardPhaseField;
