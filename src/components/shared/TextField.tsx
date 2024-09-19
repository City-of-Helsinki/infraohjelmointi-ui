import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';

interface ITextFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  hideLabel?: boolean;
  tooltip?: string;
  disabled?: boolean;
  readOnlyValue?: string;
}

const TextField: FC<ITextFieldProps> = ({
  name,
  label,
  control,
  rules,
  readOnly,
  hideLabel,
  tooltip,
  disabled,
  readOnlyValue,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSTextInput
            className="input-l"
            value={readOnlyValue ?? value}
            onChange={onChange}
            label={t(label)}
            hideLabel={hideLabel}
            id={label}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            helperText={tooltip}
            style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
            disabled={disabled}
          />
        </div>
      )}
    />
  );
};

export default memo(TextField);
