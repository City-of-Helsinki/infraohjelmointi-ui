import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
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
  const handleChange = useCallback((value: boolean, onChange: (...event: unknown[]) => void) => {
    onChange(!value);
  }, []);

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value } }) => (
        <div className="input-wrapper" id="checkbox" data-testid={name}>
          <HDSCheckbox
            data-testid={name}
            id={name}
            name={name}
            label={label}
            value={value}
            checked={value}
            onChange={() => handleChange(value, onChange)}
            onBlur={onBlur}
          />
        </div>
      )}
    />
  );
};

export default memo(CheckboxField);
