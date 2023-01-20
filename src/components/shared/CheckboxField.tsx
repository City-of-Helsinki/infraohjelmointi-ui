import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { SelectionGroup } from 'hds-react/components/SelectionGroup';
import { Checkbox as HDSCheckbox } from 'hds-react/components/Checkbox';
import { FC, memo, useCallback } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';

interface ICheckboxFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const CheckboxField: FC<ICheckboxFieldProps> = ({ name, label, control, rules }) => {
  const options = [
    { value: 'yes', label: 'Kyllä' },
    { value: 'no', label: 'Ei' },
  ];

  const valueToString = useCallback((val: boolean) => (val ? 'yes' : 'no'), []);

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          <SelectionGroup label={label} direction="horizontal" id={name}>
            {options?.map((o, i) => (
              <HDSCheckbox
                data-testid={`${name}-${i}`}
                key={o.value}
                id={`${name}-${i}`}
                label={o.label}
                value={o.value}
                onChange={onChange}
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

export default memo(CheckboxField);
