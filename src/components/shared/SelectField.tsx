import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect, SelectProps } from 'hds-react';
import { useTranslation } from 'react-i18next';
import optionIcon from '@/utils/optionIcon';
import TextField from './TextField';

type Option = { value: string; label: string };

interface ISelectFieldProps extends SelectProps {
  name: string;
  control?: HookFormControlType;
  options?: Array<Option>;
  label?: string;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
  iconKey?: string;
  shouldUpdateIcon?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  size?: 'full' | 'lg';
  shouldTranslate?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
}

const SelectField: FC<ISelectFieldProps> = ({
  name,
  label,
  control,
  options,
  rules,
  hideLabel,
  iconKey,
  shouldUpdateIcon,
  disabled,
  clearable,
  size,
  shouldTranslate,
  readOnly,
  placeholder,
  children,
  filter,
  wrapperClassName,
  ...rest
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();
  const [translate, setTranslate] = useState(true);

  const translatedOptions = useMemo(
    () =>
      translate && options !== undefined
        ? options.map(({ value, label }) => ({
            value,
            label: t(`option.${label.replace('.', '')}`),
          }))
        : options,
    [options, t, translate],
  );

  const translateValue = useCallback(
    (option: Option) => {
      if (option?.label !== '' && !option?.label?.includes('option') && translate) {
        const translatedLabel = t(`option.${option.label}`);
        if (!translatedLabel.includes('option.')) {
          return [{ value: option.value, label: translatedLabel }];
        }
      }
      return [option];
    },
    [t, translate],
  );

  useEffect(() => {
    setTranslate(shouldTranslate ?? true);
  }, [shouldTranslate]);

  const [icon, setIcon] = useState(optionIcon[iconKey as keyof typeof optionIcon]);

  const updateIconBasedOnSelection = useCallback(
    (selectedValue: string) => {
      const selectedOption = options?.find((option) => option.value === selectedValue);
      if (selectedOption) {
        const newIcon = optionIcon[selectedOption.label as keyof typeof optionIcon];
        setIcon(newIcon);
      }
    },
    [options],
  );

  useEffect(() => {
    setIcon(optionIcon[iconKey as keyof typeof optionIcon]);
  }, [iconKey]);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={rules}
      render={({
        field: { value, onChange, onBlur, disabled: fieldDisabled },
        fieldState: { error },
      }) => {
        const handleChange = (_: Option[], clickedOption: Option) => {
          onChange(clickedOption ?? { value: '', label: '' });
          if (shouldUpdateIcon && clickedOption?.value) {
            updateIconBasedOnSelection(clickedOption.value);
          }
        };
        const isDisabled = disabled || fieldDisabled;
        return (
          <div className={`input-wrapper ${wrapperClassName ?? ''}`} id={name} data-testid={name}>
            {/**
             * - icon class: indicates it has an icon and needs extra padding
             * - placeholder class: our controlled form needs an empty value and the placeholder's color only becomes
             * gray if the value is undefined
             */}
            <div
              className={`select-field-wrapper ${size ? size : ''} ${iconKey ? 'with-icon' : ''} ${
                !value || !value.value ? 'placeholder' : ''
              }`}
            >
              {readOnly ? (
                <TextField
                  name={''}
                  label={label ?? ''}
                  control={control}
                  readOnly={true}
                  readOnlyValue={translateValue(value)[0].label}
                />
              ) : (
                <HDSSelect
                  id={`select-field-${name}`}
                  className={`custom-select ${iconKey ? 'icon' : ''}`}
                  value={value ? translateValue(value) : []}
                  onChange={handleChange}
                  onBlur={onBlur}
                  invalid={error ? true : false}
                  options={translatedOptions ?? []}
                  required={required}
                  disabled={isDisabled}
                  style={{ paddingTop: hideLabel ? '1.745rem' : '0', maxWidth: '100%' }}
                  icon={icon}
                  filter={filter}
                  texts={{
                    label: !hideLabel && label ? t(label) : undefined,
                    error: error?.message,
                    placeholder: placeholder ?? t('choose'),
                  }}
                  clearable={clearable && value?.value}
                  {...rest}
                />
              )}
            </div>
          </div>
        );
      }}
    />
  );
};

export default memo(SelectField);
