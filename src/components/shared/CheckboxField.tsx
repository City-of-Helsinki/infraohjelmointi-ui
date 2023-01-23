import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Checkbox as HDSCheckbox } from 'hds-react/components/Checkbox';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';

interface ICheckboxFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const CheckboxField: FC<ICheckboxFieldProps> = ({ name, label, control, rules }) => {
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
            label={label}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
      )}
    />
  );
};

export default memo(CheckboxField);
