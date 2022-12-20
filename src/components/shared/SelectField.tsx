import { IOption, ListType } from '@/interfaces/common';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import {
  FormSubmitEventType,
  HookFormControlType,
  HookFormRulesType,
} from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { useOptions } from '@/hooks/useOptions';

interface ISelectFieldProps {
  name: ListType;
  label: string;
  handleSave: FormSubmitEventType;
  options?: Array<IOption>;
  control: HookFormControlType;
  rules?: HookFormRulesType;
}

const SelectField: FC<ISelectFieldProps> = ({ name, label, control, rules, handleSave }) => {
  const required = rules?.required ? true : false;
  const { options } = useOptions(name);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, value, onBlur }, fieldState: { isDirty, error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSSelect
              className="input-l"
              label={label || ''}
              id={label}
              invalid={error ? true : false}
              error={error?.message}
              onBlur={isDirty ? handleSave : onBlur}
              onChange={onChange}
              value={value}
              options={options}
              required={required}
            />
          </div>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(SelectField);
