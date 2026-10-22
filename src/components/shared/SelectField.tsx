import { FC, memo, useCallback, useMemo, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect, SelectProps } from 'hds-react';
import { useTranslation } from 'react-i18next';
import optionIcon from '@/utils/optionIcon';
import TextField from './TextField';

type Option = { value: string; label: string };

const hasSelectedValue = (value?: Option | Option[]) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value?.value);

const getSelectFieldWrapperClassName = (
  size: 'full' | 'lg' | undefined,
  hasIcon: boolean,
  value: unknown,
) => {
  const hasValue =
    typeof value === 'object' && value !== null && 'value' in value && Boolean(value.value);

  return `${size || ''} ${hasIcon ? 'with-icon' : ''} ${hasValue ? '' : 'placeholder'}`;
};

const getCustomSelectClassName = (hasIcon: boolean, readOnly: boolean | undefined) =>
  `custom-select ${hasIcon ? 'icon' : ''} ${readOnly ? 'read-only-select' : ''}`;

const isReadOnlyTextVariant = (readOnly: boolean | undefined, readOnlyVariant: 'text' | 'input') =>
  readOnly && readOnlyVariant === 'text';

const isSelectClearable = (
  clearable: boolean | undefined,
  hasValue: boolean,
  readOnly: boolean | undefined,
) => Boolean(clearable && hasValue && !readOnly);

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
  readOnlyVariant?: 'text' | 'input';
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
  required,
  shouldTranslate = true,
  readOnly,
  readOnlyVariant = 'text',
  placeholder,
  children,
  filter,
  wrapperClassName,
  multiSelect,
  ...rest
}) => {
  const isRequired = required ?? !!rules?.required;
  const showIcon = !readOnly || readOnlyVariant === 'input';
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
    () => options?.map((option) => translateOption(option)),
    [options, translateOption],
  );

  const translateValue = useCallback(
    (value?: Option | Option[]) => {
      if (!value) {
        return [];
      }

      const values = Array.isArray(value) ? value : [value];
      return values.map((option) => translateOption(option));
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
  const [prevIconKey, setPrevIconKey] = useState(iconKey);

  if (prevIconKey !== iconKey) {
    setPrevIconKey(iconKey);
    setIcon(resolveIcon(iconKey));
  }

  const updateIconBasedOnSelection = useCallback(
    (selectedValue: string) => {
      const selectedOption = options?.find((option) => option.value === selectedValue);
      if (selectedOption) {
        setIcon(resolveIcon(selectedOption.label));
      }
    },
    [options, resolveIcon],
  );

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
        const hasValue = hasSelectedValue(value);

        const handleChange = (selectedOptions: Option[] = [], clickedOption?: Option) => {
          if (readOnly) {
            return;
          }
          const options = multiSelect ? selectedOptions : clickedOption;
          onChange(options ?? { value: '', label: '' });
          if (shouldUpdateIcon && clickedOption?.value) {
            updateIconBasedOnSelection(clickedOption.value);
          }
        };
        const isDisabled = disabled ?? fieldDisabled;
        return (
          <div className={`input-wrapper ${wrapperClassName ?? ''}`} id={name} data-testid={name}>
            {/**
             * - icon class: indicates it has an icon and needs extra padding
             * - placeholder class: our controlled form needs an empty value and the placeholder's color only becomes
             * gray if the value is undefined
             */}
            <div
              className={`select-field-wrapper ${getSelectFieldWrapperClassName(
                size,
                Boolean(iconKey && showIcon),
                value,
              )}`}
            >
              {isReadOnlyTextVariant(readOnly, readOnlyVariant) ? (
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
                  className={getCustomSelectClassName(Boolean(iconKey && showIcon), readOnly)}
                  value={translatedValue}
                  onChange={handleChange}
                  onBlur={onBlur}
                  invalid={Boolean(error)}
                  options={translatedOptions ?? []}
                  required={isRequired}
                  disabled={readOnly || isDisabled}
                  style={{ paddingTop: hideLabel ? '1.745rem' : '0', maxWidth: '100%' }}
                  icon={showIcon ? icon : undefined}
                  filter={filter}
                  texts={{
                    label: hideLabel || !label ? undefined : t(label),
                    error: error?.message,
                    placeholder: placeholder ?? t('choose'),
                  }}
                  clearable={isSelectClearable(clearable, hasValue, readOnly)}
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
