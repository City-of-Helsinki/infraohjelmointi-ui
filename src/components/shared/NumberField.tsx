import { NumberInput as HDSNumberInput } from 'hds-react';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';

interface INumberFieldProps {
  name: string;
  label: string;
  control?: HookFormControlType;
  rules?: HookFormRulesType;
  required?: boolean;
  readOnly?: boolean;
  readOnlyVariant?: 'text' | 'input';
  tooltip?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  size?: 'full' | 'l';
}

const NumberField: FC<INumberFieldProps> = ({
  name,
  label,
  control,
  rules,
  required,
  readOnly,
  readOnlyVariant = 'text',
  tooltip,
  hideLabel,
  disabled,
  size = 'l',
}) => {
  const isRequired = required ?? !!rules?.required;
  const { t } = useTranslation();
  const isReadOnlyInput = readOnly && readOnlyVariant === 'input';

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { value, onChange, disabled: fieldDisabled }, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSNumberInput
            className={`input-${size} ${isReadOnlyInput ? 'read-only-input' : ''}`}
            value={value ?? ''}
            onChange={onChange}
            label={!hideLabel ? t(label) : ''}
            style={{ paddingTop: hideLabel ? '1.75rem' : '0' }}
            id={label}
            readOnly={readOnly}
            required={isRequired}
            invalid={error ? true : false}
            errorText={error?.message}
            helperText={tooltip}
            disabled={isReadOnlyInput || (disabled ?? fieldDisabled)}
          />
        </div>
      )}
    />
  );
};

export default memo(NumberField);
