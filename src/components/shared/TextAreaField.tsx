import { FC, memo, useEffect, useRef } from 'react';
import { Control, Controller, FieldValues, useWatch } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { TextArea as HDSTextArea, TextAreaProps } from 'hds-react';
import { useTranslation } from 'react-i18next';
import autosize from 'autosize';

interface ITextAreaFieldProps extends TextAreaProps {
  testId?: string;
  name: string;
  label: string;
  control?: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  readOnlyVariant?: 'text' | 'input';
  readOnlyValue?: string;
  wrapperClassName?: string;
  hideLabel?: boolean;
  size?: 'l' | 'xl';
  formSaved?: boolean;
  disabled?: boolean;
}

const TextAreaField: FC<ITextAreaFieldProps> = ({
  testId,
  name,
  label,
  control,
  rules,
  readOnly,
  readOnlyVariant = 'text',
  readOnlyValue,
  wrapperClassName = '',
  hideLabel,
  size,
  formSaved,
  disabled,
  tooltip,
  helperText,
  id,
  rows,
  defaultValue = '',
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const value = useWatch({ name, control: control as Control<FieldValues> });
  const isReadOnlyInput = readOnly && readOnlyVariant === 'input';

  // Autosize the textarea
  useEffect(() => {
    if (textAreaRef && textAreaRef.current) {
      const element = textAreaRef.current;
      autosize(element);
      element.style.overflow = isReadOnlyInput ? 'hidden' : 'visible';
      return () => {
        autosize.destroy(element);
      };
    }
  }, [textAreaRef, isReadOnlyInput]);

  useEffect(() => {
    if (isReadOnlyInput && textAreaRef.current) {
      autosize.update(textAreaRef.current);
    }
  }, [isReadOnlyInput, value, readOnlyValue]);

  // Autosize the textarea if form is saved successfully, this helps with resizing
  // since the backend will remove all empty rows
  useEffect(() => {
    if (formSaved && textAreaRef && textAreaRef.current) {
      const element = textAreaRef.current;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [formSaved]);

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      defaultValue={defaultValue}
      render={({
        field: { onChange, onBlur, value, disabled: fieldDisabled },
        fieldState: { error },
      }) => (
        <div className={`input-wrapper ${wrapperClassName}`} id={name} data-testid={name}>
          <HDSTextArea
            data-testid={testId}
            ref={textAreaRef}
            onChange={onChange}
            onBlur={onBlur}
            value={readOnlyValue ?? value ?? ''}
            className={`textarea-field input-${size || 'xl'} ${isReadOnlyInput ? 'read-only-input' : ''}`}
            label={t(label)}
            hideLabel={hideLabel}
            id={id ?? label}
            rows={rows}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
            disabled={isReadOnlyInput || disabled || fieldDisabled}
            tooltip={tooltip}
            helperText={helperText}
          />
        </div>
      )}
    />
  );
};

export default memo(TextAreaField);
