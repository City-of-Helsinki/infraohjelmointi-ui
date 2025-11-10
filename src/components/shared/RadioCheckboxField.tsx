import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { SelectionGroup } from 'hds-react';
import { RadioButton as HDSRadioButton } from 'hds-react';
import { ChangeEvent, FC, memo, useCallback } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TextField from './TextField';

interface IRadioCheckboxFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
  disabled?: boolean;
}

const RadioCheckboxField: FC<IRadioCheckboxFieldProps> = ({
  name,
  label,
  control,
  rules,
  readOnly,
  disabled,
}) => {
  const { t } = useTranslation();
  const options = [
    { value: 'yes', label: 'Kyllä' },
    { value: 'no', label: 'Ei' },
  ];

  const optionToBoolean = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => e.target.value === 'yes',
    [],
  );

  const valueToString = useCallback((val: boolean) => (val ? 'yes' : 'no'), []);

  return (
    <Controller
      name={name}
      rules={rules}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <div className="input-wrapper" id={name} data-testid={name}>
          {readOnly ? (
            <TextField
              name={''}
              label={label ?? ''}
              control={control}
              readOnly={true}
              readOnlyValue={options.find((o) => o.value == valueToString(value))?.label}
            />
          ) : (
            <SelectionGroup
              label={t(label) ?? ''}
              direction="horizontal"
              id="radio-checkbox"
              errorText={error?.message}
              required={true}
              disabled={disabled}
            >
              {options?.map((o, i) => (
                <HDSRadioButton
                  data-testid={`${name}-${i}`}
                  key={o.value}
                  id={`${name}-${i}`}
                  label={t(o.label)}
                  value={o.value}
                  onChange={(e) => onChange(optionToBoolean(e))}
                  onBlur={onBlur}
                  checked={valueToString(value) === o.value}
                />
              ))}
            </SelectionGroup>
          )}
        </div>
      )}
    />
  );
};

export default memo(RadioCheckboxField);
