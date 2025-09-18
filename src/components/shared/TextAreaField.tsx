import { FC, memo, useEffect, useRef } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { TextArea as HDSTextArea } from 'hds-react/components/Textarea';
import { useTranslation } from 'react-i18next';
import autosize from 'autosize';

interface ITextAreaFieldProps {
  testId?: string;
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
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
  hideLabel,
  size,
  formSaved,
  disabled,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Autosize the textarea
  useEffect(() => {
    if (textAreaRef && textAreaRef.current) {
      const element = textAreaRef.current;
      autosize(element);
      element.style.overflow = 'visible';
    }
  }, [textAreaRef]);

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
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSTextArea
            data-testid={testId}
            ref={textAreaRef}
            onChange={onChange}
            value={value}
            className={`textarea-field input-${size || 'xl'}`}
            label={t(label)}
            hideLabel={hideLabel}
            id={label}
            readOnly={readOnly}
            required={required}
            invalid={error ? true : false}
            errorText={error?.message}
            style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
            disabled={disabled}
          />
        </div>
      )}
    />
  );
};

export default memo(TextAreaField);
