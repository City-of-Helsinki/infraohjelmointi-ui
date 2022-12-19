import { NumberInput as HDSNumberInput } from 'hds-react/components/NumberInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface INumberFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const NumberField: FC<INumberFieldProps> = ({ name, label, control, rules, readOnly }) => {
  const required = rules?.required ? true : false;
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSNumberInput
            className={`input-l`}
            label={label}
            id={label}
            value={field.value || ''}
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

export default memo(NumberField);
