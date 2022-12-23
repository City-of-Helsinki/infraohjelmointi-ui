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
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSDateInput
              className="input-m"
              {...field}
              placeholder={''}
              label={label}
              language="fi"
              id={label}
              readOnly={readOnly}
              required={required}
              invalid={error ? true : false}
              errorText={error?.message}
            />
          </div>
        );
      }}
    />
  );
};

export default memo(DateField);
