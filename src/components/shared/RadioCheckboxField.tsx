import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { SelectionGroup } from 'hds-react/components/SelectionGroup';
import { RadioButton as HDSRadioButton } from 'hds-react/components/RadioButton';
import { ChangeEvent, ChangeEventHandler, FC, FocusEventHandler, forwardRef, Ref } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { IOption } from '@/interfaces/common';

interface IInputProps {
  name: string;
  value: string;
  options?: Array<IOption>;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  required?: boolean;
}

const Input: FC<IInputProps> = forwardRef(
  ({ name, value, onChange, onBlur, label, options }, ref: Ref<HTMLDivElement>) => {
    return (
      <div className="input-wrapper" id={name} data-testid={name} ref={ref}>
        <SelectionGroup label={label} direction="horizontal">
          {options?.map((o, i) => (
            <HDSRadioButton
              key={o.value}
              id={`${name}-${i}`}
              label={o.label}
              value={o.value}
              onChange={onChange}
              onBlur={onBlur}
              checked={value === o.value}
            />
          ))}
        </SelectionGroup>
      </div>
    );
  },
);

interface IRadioCheckboxFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const RadioCheckboxField: FC<IRadioCheckboxFieldProps> = ({ name, label, control, rules }) => {
  const required = rules?.required ? true : false;
  const options = [
    { value: 'yes', label: 'Kyllä' },
    { value: 'no', label: 'Ei' },
  ];
  const optionToBoolean = (e: ChangeEvent<HTMLInputElement>) => e.target.value === 'yes';
  const valueToString = (val: boolean) => (val ? 'yes' : 'no');

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          {...fieldState}
          label={label}
          required={required}
          value={valueToString(field.value)}
          options={options}
          onChange={(e) => field.onChange(optionToBoolean(e))}
        />
      )}
      rules={rules}
    />
  );
};

Input.displayName = 'Input';

export default RadioCheckboxField;
