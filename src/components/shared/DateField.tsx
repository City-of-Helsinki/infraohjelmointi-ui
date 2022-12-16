import { DateInput as HDSDateInput } from 'hds-react/components/DateInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

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
      render={({ field, fieldState }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSDateInput
              className="input-m"
              placeholder={''}
              onChange={field.onChange}
              label={label}
              language="fi"
              id={label}
              value={field.value}
              readOnly={readOnly}
              onBlur={field.onBlur}
              required={required}
              invalid={fieldState.error ? true : false}
              errorText={fieldState.error?.message}
            />
          </div>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(DateField);
