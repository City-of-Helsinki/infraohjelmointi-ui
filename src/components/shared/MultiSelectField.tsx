import { ListType } from '@/interfaces/common';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { useOptions } from '@/hooks/useOptions';
import { IconLocation } from 'hds-react/icons';

interface IMultiSelectFieldProps {
  name: ListType;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
  icon?: string;
  placeholder?: string;
}

const MultiSelectField: FC<IMultiSelectFieldProps> = ({
  name,
  label,
  control,
  rules,
  hideLabel,
  icon,
  placeholder,
}) => {
  const required = rules?.required ? true : false;
  const { options } = useOptions(name);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSSelect
              onChange={onChange}
              multiselect
              className="input-l"
              label={!hideLabel && label}
              placeholder={placeholder}
              helper="Assistive text"
              options={options}
              value={value || []}
              clearButtonAriaLabel="Clear all selections"
              selectedItemRemoveButtonAriaLabel="Remove ${value}"
              onBlur={onBlur}
              invalid={error ? true : false}
              error={error?.message}
              required={required}
              style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
              icon={icon === 'location' && <IconLocation />}
            />
          </div>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(MultiSelectField);
