import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { FC, useState, FocusEvent, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface ITextFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  handleSave: any;
}

const TextField: FC<ITextFieldProps> = ({ name, label, control, rules, readOnly, handleSave }) => {
  const required = rules?.required ? true : false;
  const [valueOnFocus, setValueOnFocus] = useState('');

  // const handleSetInitialValue
  const handleSetInitialValue = (e: FocusEvent<HTMLInputElement>) => {
    setValueOnFocus(e.target.value);
  };

  const handleAutoSave = (e: FocusEvent<HTMLInputElement>) => {
    if (e.target.value === valueOnFocus) {
      return;
    } else {
      handleSave();
    }
  };

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
            onBlur={handleAutoSave}
            onFocus={handleSetInitialValue}
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
