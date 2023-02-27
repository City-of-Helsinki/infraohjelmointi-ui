import { IOption } from '@/interfaces/common';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { IconLocation, IconUser } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';

interface ISelectFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  options: Array<IOption>;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
  icon?: string;
  placeholder?: string;
}

const SelectField: FC<ISelectFieldProps> = ({
  name,
  label,
  control,
  options,
  rules,
  hideLabel,
  icon,
  placeholder,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSSelect
              className="input-l"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              label={!hideLabel && t(label)}
              invalid={error ? true : false}
              error={error?.message}
              options={options || []}
              required={required}
              style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
              placeholder={placeholder}
              icon={
                icon === 'location' ? (
                  <IconLocation />
                ) : icon === 'person' ? (
                  <IconUser />
                ) : undefined
              }
            />
          </div>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(SelectField);
