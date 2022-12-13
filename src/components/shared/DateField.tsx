import { DateInput as HDSDateInput } from 'hds-react/components/DateInput';
import { FC, FocusEventHandler, forwardRef, Ref } from 'react';
import { Control, Controller, FieldError, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface IDateInput {
  name: string;
  value: string;
  label: string;
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  placeholder?: string;
  readOnly?: boolean;
  error?: FieldError;
  required?: boolean;
  onDateChange: (value: string) => void;
}

const Input: FC<IDateInput> = forwardRef(
  (
    { name, value, placeholder, readOnly, error, onBlur, label, required, onDateChange },
    ref: Ref<HTMLInputElement>,
  ) => {
    const noRefChange = (value: string) => {
      onDateChange(value);
    };
    return (
      <div className="input-wrapper" id={name} data-testid={name}>
        <HDSDateInput
          className="input-m"
          placeholder={placeholder || ''}
          onChange={noRefChange}
          label={label}
          language="fi"
          id={label}
          value={value}
          readOnly={readOnly}
          onBlur={onBlur}
          required={required}
          ref={ref}
          invalid={error ? true : false}
          errorText={error?.message}
        />
      </div>
    );
  },
);

interface IDateFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const DateField: FC<IDateFieldProps> = ({ name, label, control, rules, readOnly }) => {
  const required = rules?.required ? true : false;
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          {...fieldState}
          label={label}
          readOnly={readOnly}
          required={required}
          onDateChange={(value) => field.onChange(value)}
        />
      )}
      rules={rules}
    />
  );
};

Input.displayName = 'Input';

export default DateField;
