import { InputSizeType, IOption, ListType, SelectCallback } from '@/interfaces/common';
import { FC, forwardRef, Ref } from 'react';
import { Control, Controller, FieldError, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select } from 'hds-react/components/Select';
import { useOptions } from '@/hooks/useOptions';

interface IDropdownOptions {
  options: Array<IOption>;
  name: string;
  value: IOption;
  onChange: SelectCallback;
  label?: string;
  size?: InputSizeType;
  onBlur?: (() => void) | undefined;
  required?: boolean;
  error?: FieldError;
}

const Dropdown: FC<IDropdownOptions> = forwardRef((props, ref: Ref<HTMLInputElement>) => {
  const { label, error, size, name, ...selectProps } = props;
  return (
    <div className="input-wrapper" ref={ref} id={name} data-testid={name}>
      <Select
        className={`input-${size || 'l'}`}
        label={label || ''}
        id={label}
        invalid={error ? true : false}
        error={error?.message}
        {...selectProps}
      />
    </div>
  );
});

interface ISelectFieldProps {
  name: ListType;
  label: string;
  options?: Array<IOption>;
  control: HookFormControlType;
  rules?: HookFormRulesType;
}

const SelectField: FC<ISelectFieldProps> = ({ name, label, control, rules }) => {
  const required = rules?.required ? true : false;
  const { options } = useOptions(name);

  console.log('Options: ', options);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => {
        return (
          <Dropdown
            {...field}
            {...fieldState}
            label={label}
            required={required}
            options={options}
          />
        );
      }}
      rules={rules}
    />
  );
};

Dropdown.displayName = 'Dropdown';

export default SelectField;
