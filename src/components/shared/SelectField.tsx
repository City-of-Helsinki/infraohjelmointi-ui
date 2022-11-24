import { InputSizeType, IOptionType, SelectCallback } from '@/interfaces/common';
import { FC, forwardRef, Ref } from 'react';
import { Control, Controller, FieldError, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select } from 'hds-react/components/Select';
import { useTranslation } from 'react-i18next';
import translationFI from '@/i18n/fi.json';

interface IDropdownOptions {
  options: Array<IOptionType> | undefined;
  name: string;
  value: IOptionType;
  onChange: SelectCallback;
  label?: string;
  size?: InputSizeType;
  onBlur?: (() => void) | undefined;
  required?: boolean;
  error?: FieldError;
}

const Dropdown: FC<IDropdownOptions> = forwardRef(
  (
    { options, onChange, label, size, required, value, onBlur, name, error },
    ref: Ref<HTMLInputElement>,
  ) => {
    const { t } = useTranslation();

    return (
      <div className="input-wrapper" ref={ref} id={name} data-testid={name}>
        <Select
          className={`input-${size || 'l'}`}
          label={label || ''}
          id={label}
          defaultValue={{ label: value ? t(`enums.${value}`) : '' }}
          options={options || []}
          onChange={onChange}
          required={required}
          onBlur={onBlur}
          invalid={error ? true : false}
          error={error?.message}
        />
      </div>
    );
  },
);

interface ISelectFieldProps {
  name: string;
  label: string;
  options: Array<IOptionType> | undefined;
  control: HookFormControlType;
  rules?: HookFormRulesType;
}

const SelectField: FC<ISelectFieldProps> = ({ name, label, control, rules, options }) => {
  const required = rules?.required ? true : false;

  // Since HDS-Select doesn't have the option for have a sepparate "value", we need to get the
  // property key from our translation file when saving this to form
  const getEnumKey = (label: string) =>
    Object.keys(translationFI.enums).find(
      (key) => translationFI.enums[key as keyof typeof translationFI.enums] === label,
    );

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field, fieldState }) => (
        <Dropdown
          {...field}
          {...fieldState}
          label={label}
          required={required}
          options={options}
          onChange={(e) => field.onChange(getEnumKey(e.label))}
        />
      )}
      rules={rules}
    />
  );
};

Dropdown.displayName = 'Dropdown';

export default SelectField;
