import { IOption, ListType } from '@/interfaces/common';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { useOptions } from '@/hooks/useOptions';

interface ISelectFieldProps {
  name: ListType;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
}

const SelectField: FC<ISelectFieldProps> = ({ name, label, control, rules, hideLabel }) => {
  const required = rules?.required ? true : false;
  const { options } = useOptions(name);

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
              label={!hideLabel && label}
              id={label}
              invalid={error ? true : false}
              error={error?.message}
              options={options}
              required={required}
              style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
            />
          </div>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(SelectField);
