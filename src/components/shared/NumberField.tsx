import { NumberInput as HDSNumberInput } from 'hds-react/components/NumberInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';

interface INumberFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  tooltip?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}

const NumberField: FC<INumberFieldProps> = ({
  name,
  label,
  control,
  rules,
  readOnly,
  tooltip,
  hideLabel,
  disabled,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();
  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSNumberInput
            className="input-l"
            value={value ?? ''}
            onChange={onChange}
            label={!hideLabel ? t(label) : ''}
            style={{ paddingTop: hideLabel ? '1.75rem' : '0' }}
            id={label}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            helperText={tooltip}
            disabled={disabled}
          />
        </div>
      )}
    />
  );
};

export default memo(NumberField);
