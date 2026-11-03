import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { TextArea as HDSTextArea, TextAreaProps } from 'hds-react';
import { useTranslation } from 'react-i18next';

interface ITextAreaFieldProps extends TextAreaProps {
  testId?: string;
  name: string;
  label: string;
  control?: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  hideLabel?: boolean;
  size?: 'l' | 'xl';
  disabled?: boolean;
}

const TextAreaField: FC<ITextAreaFieldProps> = ({
  testId,
  name,
  label,
  control,
  rules,
  readOnly,
  hideLabel,
  size,
  disabled,
  tooltip,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      defaultValue=""
      render={({
        field: { onChange, onBlur, value, disabled: fieldDisabled },
        fieldState: { error },
      }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSTextArea
            data-testid={testId}
            onChange={onChange}
            onBlur={onBlur}
            value={value ?? ''}
            className={`input-${size || 'xl'}`}
            label={t(label)}
            hideLabel={hideLabel}
            id={label}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
            disabled={disabled || fieldDisabled}
            tooltip={tooltip}
          />
        </div>
      )}
    />
  );
};

export default memo(TextAreaField);
