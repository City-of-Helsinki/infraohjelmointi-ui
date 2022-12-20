import { DateInput as HDSDateInput } from 'hds-react/components/DateInput';
import { FC, memo, useCallback, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface IDateFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  handleSave: any;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const DateField: FC<IDateFieldProps> = ({ name, label, control, rules, readOnly, handleSave }) => {
  const required = rules?.required ? true : false;
  const [focused, setFocused] = useState(false);

  const handleSetFocused = useCallback(
    () => setFocused((currentValue) => !currentValue),
    [setFocused],
  );

  const handleChangeAndSave = (onChange: (...event: unknown[]) => void, value: string) => {
    onChange(value);
    handleSave();
  };

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value, onBlur }, fieldState: { isDirty, error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSDateInput
              className="input-m"
              placeholder={''}
              onFocus={handleSetFocused}
              onChange={!focused ? (value) => handleChangeAndSave(onChange, value) : onChange}
              label={label}
              language="fi"
              id={label}
              value={value}
              readOnly={readOnly}
              onBlur={isDirty ? handleSave : onBlur}
              required={required}
              invalid={error ? true : false}
              errorText={error?.message}
              onButtonClick={() => console.log('button click')}
            />
          </div>
        );
      }}
    />
  );
};

export default memo(DateField);
