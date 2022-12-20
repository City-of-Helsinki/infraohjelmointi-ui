import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface ITextFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  handleSave: any;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const TextField: FC<ITextFieldProps> = ({ name, label, control, rules, readOnly, handleSave }) => {
  const required = rules?.required ? true : false;

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { isDirty, error } }) => (
        <>
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSTextInput
              className="input-l"
              placeholder={''}
              label={label}
              id={label}
              value={value}
              readOnly={readOnly}
              onChange={onChange}
              onBlur={isDirty ? handleSave : null}
              required={required}
              invalid={error ? true : false}
              errorText={error?.message}
            />
          </div>
        </>
      )}
    />
  );
};

export default memo(TextField);
