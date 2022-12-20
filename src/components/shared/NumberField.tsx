import { NumberInput as HDSNumberInput } from 'hds-react/components/NumberInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';

interface INumberFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  handleSave: any;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const NumberField: FC<INumberFieldProps> = ({
  name,
  label,
  control,
  rules,
  readOnly,
  handleSave,
}) => {
  const required = rules?.required ? true : false;
  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value }, fieldState: { isDirty, error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSNumberInput
            className={`input-l`}
            label={label}
            id={label}
            value={value || ''}
            readOnly={readOnly}
            onChange={onChange}
            onBlur={isDirty ? handleSave : null}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
          />
        </div>
      )}
    />
  );
};

export default memo(NumberField);
