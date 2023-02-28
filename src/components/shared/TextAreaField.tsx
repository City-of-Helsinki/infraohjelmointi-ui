import { FC, KeyboardEvent, memo, useEffect, useRef } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { TextArea as HDSTextArea } from 'hds-react/components/Textarea';
import { useTranslation } from 'react-i18next';

interface ITextAreaFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  hideLabel?: boolean;
  size?: 'l' | 'xl';
}

const TextAreaField: FC<ITextAreaFieldProps> = ({
  name,
  label,
  control,
  rules,
  readOnly,
  hideLabel,
  size,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const setTextAreaHeight = (element: HTMLTextAreaElement) => {
    const height = element.scrollHeight;
    element.style.cssText = 'height: inherit !important';
    element.style.cssText = `height: ${height}px !important`;
  };

  const handleResize = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    setTextAreaHeight(e.target as HTMLTextAreaElement);
  };

  useEffect(() => {
    if (textAreaRef && textAreaRef.current) {
      setTextAreaHeight(textAreaRef.current);
    }
  }, [textAreaRef]);

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <div className={`input-wrapper`} id={name} data-testid={name}>
          <HDSTextArea
            ref={textAreaRef}
            onKeyDown={handleResize}
            onSelect={handleResize}
            onChange={onChange}
            onBlur={onBlur}
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
          />
        </div>
      )}
    />
  );
};

export default memo(TextAreaField);
