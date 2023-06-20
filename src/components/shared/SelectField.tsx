import { IOption } from '@/interfaces/common';
import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { IconCrossCircle } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import optionIcon from '@/utils/optionIcon';

// const getIcon = (icon?: string) => {
//   if (icon === 'location') {
//     return <IconLocation />;
//   } else if (icon === 'person') {
//     return <IconUser />;
//   } else {
//     return undefined;
//   }
// };

interface ISelectFieldProps {
  name: string;
  control: HookFormControlType;
  options: Array<IOption>;
  label?: string;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
  icon?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: 'full' | 'lg';
  shouldTranslate?: boolean;
}

const SelectField: FC<ISelectFieldProps> = ({
  name,
  label,
  control,
  options,
  rules,
  hideLabel,
  icon,
  placeholder,
  disabled,
  clearable,
  size,
  shouldTranslate,
}) => {
  const required = rules?.required ? true : false;
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [translate, setTranslate] = useState(true);

  /**
   * Empties the selected value for the SelectField and focuses the field afterwards so that
   * autosave-functionality works with the remove button.
   *
   * Since the HDS SelectField's button cannot be given a ref, we need to give the ref to the parent element
   * to access the child elements for the button when focusing it.
   */
  const handleRemoveSelection = useCallback((onChange: (...event: unknown[]) => void) => {
    if (!selectContainerRef?.current) {
      return;
    }
    // If the SelectField has a label
    if (selectContainerRef.current.children[0]?.children[1]?.children[0]) {
      onChange({ value: '', label: '' });
      (selectContainerRef.current.children[0].children[1].children[0] as HTMLButtonElement).focus();
    }
    // If the SelectField doesn't have a label
    else if (selectContainerRef.current.children[0]?.children[0]?.children[0]) {
      onChange({ value: '', label: '' });
      (selectContainerRef.current.children[0].children[0].children[0] as HTMLButtonElement).focus();
    }
  }, []);

  const translatedOptions = useMemo(
    () =>
      translate
        ? options.map(({ value, label }) => ({ value, label: t(`option.${label}`) }))
        : options,
    [options, t, translate],
  );

  const translateValue = useCallback(
    (option: IOption) => {
      console.log('option label: ', option.label);

      if (option.label !== '' && !option.label.includes('option') && translate) {
        const translatedLabel = t(`option.${option.label}`);
        if (!translatedLabel.includes('option.')) {
          return { value: option.value, label: translatedLabel };
        }
      }
      return option;
    },
    [t, translate],
  );

  useEffect(() => {
    setTranslate(shouldTranslate ?? true);
  }, [shouldTranslate]);

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <div className={`select-field-wrapper ${size ? size : ''}`} ref={selectContainerRef}>
              <HDSSelect
                id={`select-field-${name}`}
                className={`custom-select ${icon ? 'icon' : ''}`}
                value={translateValue(value)}
                onChange={onChange}
                onBlur={onBlur}
                label={!hideLabel && label && t(label)}
                invalid={error ? true : false}
                error={error?.message}
                options={translatedOptions ?? []}
                required={required}
                disabled={disabled}
                style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
                placeholder={(placeholder && t(placeholder ?? '')) ?? ''}
                icon={optionIcon[icon as keyof typeof optionIcon]}
              />
              {((clearable === undefined && value.value) || (clearable && value.value)) && (
                <button
                  className="empty-select-field-button"
                  data-testid={`empty-${name}-selection-button`}
                  onClick={() => handleRemoveSelection(onChange)}
                >
                  <IconCrossCircle />
                </button>
              )}
            </div>
          </div>
        );
      }}
    />
  );
};

export default memo(SelectField);
