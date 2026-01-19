import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { HookFormRulesType } from '@/interfaces/formInterfaces';
import { RadioButton, RadioButtonProps } from 'hds-react';

interface IRadioButtonFieldProps<T extends FieldValues> extends RadioButtonProps {
  id: string;
  name: FieldPath<T>;
  value: string;
  label: string;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

export default function RadioButtonField<T extends FieldValues>({
  id,
  name,
  value,
  label,
  rules,
  readOnly,
  disabled,
  ...rest
}: Readonly<IRadioButtonFieldProps<T>>) {
  const {
    field: { onChange, onBlur, value: inputValue, ref, disabled: fieldDisabled },
  } = useController({ name, rules });

  return (
    <RadioButton
      id={id}
      label={label}
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      ref={ref}
      checked={inputValue === value}
      disabled={disabled ?? fieldDisabled}
      data-testid={id}
      {...rest}
    />
  );
}
