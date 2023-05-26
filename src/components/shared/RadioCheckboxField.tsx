import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { SelectionGroup } from 'hds-react/components/SelectionGroup';
import { RadioButton as HDSRadioButton } from 'hds-react/components/RadioButton';
import { ChangeEvent, FC, memo, useCallback } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface IRadioCheckboxFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  rules?: HookFormRulesType;
  readOnly?: boolean;
}

const RadioCheckboxField: FC<IRadioCheckboxFieldProps> = ({ name, label, control, rules }) => {
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
          <SelectionGroup
            label={t(label) ?? ''}
            direction="horizontal"
            id="radio-checkbox"
            errorText={error?.message}
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
        </div>
      )}
    />
  );
};

export default memo(RadioCheckboxField);
