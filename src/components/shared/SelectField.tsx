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
  shouldTranslate = true,
  readOnly,
  placeholder,
  children,
  filter,
  wrapperClassName,
  multiSelect,
  ...rest
}) => {
  const required = rules?.required ? true : false;
  const { t } = useTranslation();

  const translateOption = useCallback(
    (option: Option) => {
      if (!shouldTranslate || !option?.label || option.label.includes('option')) {
        return option;
      }

      const translatedLabel = t(`option.${option.label.replace('.', '')}`);
      if (translatedLabel.includes('option.')) {
        return option;
      }

      return { value: option.value, label: translatedLabel };
    },
    [t, shouldTranslate],
  );

  const translatedOptions = useMemo(
    () => options?.map(translateOption),
    [options, translateOption],
  );

  const translateValue = useCallback(
    (value?: Option | Option[]) => {
      if (!value) {
        return [];
      }

      const values = Array.isArray(value) ? value : [value];
      return values.map(translateOption);
    },
    [translateOption],
  );

  const resolveIcon = useCallback((key?: string) => {
    if (!key || !(key in optionIcon)) {
      return undefined;
    }

    return optionIcon[key as keyof typeof optionIcon];
  }, []);

  const [icon, setIcon] = useState(resolveIcon(iconKey));

  const updateIconBasedOnSelection = useCallback(
    (selectedValue: string) => {
      const selectedOption = options?.find((option) => option.value === selectedValue);
      if (selectedOption) {
        setIcon(resolveIcon(selectedOption.label));
      }
    },
    [options, resolveIcon],
  );

  useEffect(() => {
    setIcon(resolveIcon(iconKey));
  }, [iconKey, resolveIcon]);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={rules}
      render={({
        field: { value, onChange, onBlur, disabled: fieldDisabled },
        fieldState: { error },
      }) => {
        const translatedValue = translateValue(value);
        const readOnlyValue = translatedValue.at(0)?.label;
        const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value?.value);

        const handleChange = (selectedOptions: Option[] = [], clickedOption?: Option) => {
          const options = multiSelect ? selectedOptions : clickedOption;
          onChange(options ?? { value: '', label: '' });
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
                  readOnlyValue={readOnlyValue}
                />
              ) : (
                <HDSSelect
                  id={`select-field-${name}`}
                  className={`custom-select ${iconKey ? 'icon' : ''}`}
                  value={translatedValue}
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
                  clearable={Boolean(clearable && hasValue)}
                  multiSelect={multiSelect}
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
