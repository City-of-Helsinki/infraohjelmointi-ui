import { useOptions } from '@/hooks/useOptions';
import { Select } from 'hds-react/components/Select';
import { IconFaceSmile } from 'hds-react/icons';
import { FC, useMemo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IProjectHeaderFieldProps } from './ProjectHeader';

const ProjectPhaseField: FC<IProjectHeaderFieldProps> = ({ control }) => {
  const { t } = useTranslation();
  const icon = useMemo(() => <IconFaceSmile />, []);
  const phases = useOptions('phases');

  return (
    <Controller
      name="phase"
      control={control as Control<FieldValues>}
      render={({ field: { value, onChange, onBlur } }) => (
        <div data-testid="project-phase">
          <Select
            label={null}
            value={value}
            onBlur={onBlur}
            icon={icon}
            placeholder={t('projectPhase') || ''}
            options={phases}
            onChange={onChange}
          />
        </div>
      )}
    />
  );
};

export default ProjectPhaseField;
