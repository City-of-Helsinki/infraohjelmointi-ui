import { InputSizeType } from '@/interfaces/common';
import { NumberInput as HDSNumberInput } from 'hds-react/components/NumberInput';
import { ChangeEventHandler, FC, FocusEventHandler, forwardRef, Ref } from 'react';
import { Control, Controller, FieldError, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface IInputProps {
  name: string;
  value: number;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  size?: InputSizeType;
  placeholder?: number;
  readOnly?: boolean;
  error?: FieldError;
  required?: boolean;
}

const Input: FC<IInputProps> = forwardRef(
  (
    { name, value, size, readOnly, error, onChange, onBlur, label, required },
    ref: Ref<HTMLInputElement>,
  ) => {
    return (
      <div className="input-wrapper" id={name} data-testid={name}>
        <HDSNumberInput
          className={`input-${size || 'l'}`}
          label={label}
          id={label}
          value={value || ''}
          readOnly={readOnly}
          onChange={onChange}
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

interface INumberFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const NumberField: FC<INumberFieldProps> = ({ name, label, control, rules, readOnly }) => {
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

export default NumberField;
