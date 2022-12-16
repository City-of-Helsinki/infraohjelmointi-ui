import { IOption, ListType } from '@/interfaces/common';
import { FC, memo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select } from 'hds-react/components/Select';
import { useOptions } from '@/hooks/useOptions';

interface ISelectFieldProps {
  name: ListType;
  label: string;
  options?: Array<IOption>;
  control: HookFormControlType;
  rules?: HookFormRulesType;
}

const SelectField: FC<ISelectFieldProps> = ({ name, label, control, rules }) => {
  const required = rules?.required ? true : false;
  const { options } = useOptions(name);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => {
        return (
          <Select
            className="input-l"
            label={label || ''}
            id={label}
            invalid={fieldState.error ? true : false}
            error={fieldState.error?.message}
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value}
            options={options}
            required={required}
          ></Select>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(SelectField);
