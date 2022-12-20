import { DateInput as HDSDateInput } from 'hds-react/components/DateInput';
import { FC, memo } from 'react';
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

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value }, fieldState: { isDirty, error } }) => {
        return (
          <>
            <div className="input-wrapper" id={name} data-testid={name}>
              <HDSDateInput
                className="input-m"
                placeholder={''}
                onChange={() => console.log('change')} // always triggers when value changes
                onFocus={() => console.log('focus')} // only triggers when using the textfield (not the calendar)
                label={label}
                language="fi"
                id={label}
                value={value}
                readOnly={readOnly}
                onBlur={() => console.log('blurred')} // only triggers when using the textfield (not the calendar)
                required={required}
                invalid={error ? true : false}
                errorText={error?.message}
                onButtonClick={() => console.log('button click')}
              />
            </div>
            {/* {console.log('isdirty: ', isDirty)} */}
          </>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(DateField);
