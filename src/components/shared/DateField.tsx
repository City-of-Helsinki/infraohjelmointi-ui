import { DateInput as HDSDateInput } from 'hds-react/components/DateInput';
import { ChangeEventHandler, FC, FocusEventHandler, forwardRef, Ref } from 'react';
import { Control, Controller, FieldError, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface IDateInput {
  name: string;
  value: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  placeholder?: string;
  readOnly?: boolean;
  error?: FieldError;
  required?: boolean;
}

const Input: FC<IDateInput> = forwardRef(
  (
    { name, value, placeholder, readOnly, error, onBlur, label, required },
    ref: Ref<HTMLInputElement>,
  ) => {
    return (
      <div className="input-wrapper" id={name} data-testid={name}>
        <HDSDateInput
          className="input-m"
          placeholder={placeholder || ''}
          label={label}
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
        <Input {...field} {...fieldState} label={label} readOnly={readOnly} required={required} />
      )}
      rules={rules}
    />
  );
};

Input.displayName = 'Input';

export default DateField;
