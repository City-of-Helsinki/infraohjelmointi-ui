import { FC, memo, useMemo } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { useTranslation } from 'react-i18next';
import { IOption } from '@/interfaces/common';
import optionIcon from '@/utils/optionIcon';

interface IMultiSelectFieldProps {
  name: string;
  label: string;
  control: HookFormControlType;
  options: Array<IOption>;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
  iconKey?: string;
}

const MultiSelectField: FC<IMultiSelectFieldProps> = ({
  name,
  label,
  control,
  options,
  rules,
  hideLabel,
  iconKey,
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();
  const icon = useMemo(() => optionIcon[iconKey as keyof typeof optionIcon], []);
  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <HDSSelect
              onChange={onChange}
              multiselect
              className="input-l"
              label={!hideLabel && t(label)}
              placeholder={t('choose') ?? ''}
              options={options}
              value={value || []}
              clearButtonAriaLabel="Clear all selections"
              selectedItemRemoveButtonAriaLabel="Remove ${value}"
              onBlur={onBlur}
              invalid={error ? true : false}
              error={error?.message}
              required={required}
              style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
              icon={icon}
            />
          </div>
        );
      }}
      rules={rules}
    />
  );
};

export default memo(MultiSelectField);
