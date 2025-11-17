import { TextInput as HDSTextInput, TextInputProps } from 'hds-react';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { useTranslation } from 'react-i18next';

interface ITextFieldProps extends Omit<TextInputProps, 'size' | 'id' | 'tooltip'> {
  name: string;
  label: string;
  control?: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  hideLabel?: boolean;
  tooltip?: string;
  disabled?: boolean;
  readOnlyValue?: string;
  id?: string;
  defaultValue?: string;
  wrapperClassName?: string;
  size?: 'full' | 'l';
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
  id,
  defaultValue = '',
  wrapperClassName = '',
  size = 'l',
  ...rest
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      defaultValue={defaultValue}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={`input-wrapper ${wrapperClassName}`} id={name} data-testid={name}>
          <HDSTextInput
            className={`input-${size}`}
            value={readOnlyValue ?? value}
            onChange={onChange}
            label={t(label)}
            hideLabel={hideLabel}
            id={id ?? label}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            helperText={tooltip}
            style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
            disabled={disabled}
            {...rest}
          />
        </div>
      )}
    />
  );
};

export default memo(TextField);
