import { DateInput as HDSDateInput } from 'hds-react';
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
  const currentDate = new Date();
  const datePlus10Years = new Date(currentDate.getFullYear() + 10, 11, 31);

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
              maxDate={datePlus10Years}
              disableDatePicker={readOnly}
            />
          </div>
        );
      }}
    />
  );
};

export default memo(DateField);
