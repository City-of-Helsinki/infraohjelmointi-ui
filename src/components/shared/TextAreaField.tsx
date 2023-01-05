import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { TextArea as HDSTextArea } from 'hds-react/components/Textarea';

interface ITextAreaFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  hideLabel?: boolean;
}

const TextAreaField: FC<ITextAreaFieldProps> = ({
  name,
  label,
  control,
  rules,
  readOnly,
  hideLabel,
}) => {
  const required = rules?.required ? true : false;
  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <HDSTextArea
            {...field}
            label={label}
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
