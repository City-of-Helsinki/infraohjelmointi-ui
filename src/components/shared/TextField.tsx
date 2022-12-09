import { InputSizeType } from '@/interfaces/common';
import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { ChangeEventHandler, FC, FocusEventHandler, forwardRef, Ref } from 'react';
import { Control, Controller, FieldError, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface IInputProps {
  name: string;
  value: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  size?: InputSizeType;
  placeholder?: string;
  readOnly?: boolean;
  error?: FieldError;
  required?: boolean;
}

const Input: FC<IInputProps> = forwardRef(
  (
    { name, value, size, placeholder, readOnly, error, onChange, onBlur, label, required },
    ref: Ref<HTMLInputElement>,
  ) => {
    console.log('Error: ', error);
    return (
      <div className="input-wrapper" id={name} data-testid={name}>
        <HDSTextInput
          className={`input-${size || 'l'}`}
          placeholder={placeholder || ''}
          label={label}
          id={label}
          value={value}
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

interface ITextFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const TextField: FC<ITextFieldProps> = ({ name, label, control, rules, readOnly }) => {
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

export default TextField;
