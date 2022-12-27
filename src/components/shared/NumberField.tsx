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
  tooltip?: string;
  hideLabel?: boolean;
}

const NumberField: FC<INumberFieldProps> = ({ name, label, control, rules, readOnly, tooltip }) => {
  const required = rules?.required ? true : false;
  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSNumberInput
            className={`input-l`}
            {...field}
            value={field.value || ''}
            label={label}
            id={label}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            helperText={tooltip}
          />
        </div>
      )}
    />
  );
};

export default memo(NumberField);
