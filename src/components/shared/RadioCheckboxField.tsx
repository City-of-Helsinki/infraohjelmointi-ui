import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { SelectionGroup } from 'hds-react/components/SelectionGroup';
import { RadioButton as HDSRadioButton } from 'hds-react/components/RadioButton';
import { ChangeEvent, FC } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';

interface IRadioCheckboxFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const RadioCheckboxField: FC<IRadioCheckboxFieldProps> = ({ name, label, control, rules }) => {
  const optionToBoolean = (e: ChangeEvent<HTMLInputElement>) => e.target.value === 'yes';
  const valueToString = (val: boolean) => (val ? 'yes' : 'no');
  const options = [
    { value: 'yes', label: 'Kyllä' },
    { value: 'no', label: 'Ei' },
  ];

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <SelectionGroup label={label} direction="horizontal" id="radio-checkbox">
            {options?.map((o, i) => (
              <HDSRadioButton
                data-testid={`${name}-${i}`}
                key={o.value}
                id={`${name}-${i}`}
                label={o.label}
                value={o.value}
                onChange={(e) => onChange(optionToBoolean(e))}
                onBlur={onBlur}
                checked={valueToString(value) === o.value}
              />
            ))}
          </SelectionGroup>
        </div>
      )}
    />
  );
};

export default RadioCheckboxField;
