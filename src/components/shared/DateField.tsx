import { DateInput as HDSDateInput } from 'hds-react/components/DateInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';

interface IDateFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const DateField: FC<IDateFieldProps> = ({ name, label, control, rules, readOnly }) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <div className="input-wrapper date-field-wrapper" id={name} data-testid={name}>
            <HDSDateInput
              className="input-l date-input"
              onChange={onChange}
              value={value}
              placeholder={''}
              label={t(label)}
              language="fi"
              id={label}
              readOnly={readOnly}
              required={required}
              initialMonth={new Date()}
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
