import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
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
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSTextInput
            className={`input-l`}
            placeholder={''}
            label={label}
            id={label}
            value={field.value}
            readOnly={readOnly}
            onChange={field.onChange}
            onBlur={field.onBlur}
            required={required}
            invalid={fieldState.error ? true : false}
            errorText={fieldState.error?.message}
          />
        </div>
      )}
      rules={rules}
    />
  );
};

export default memo(TextField);
