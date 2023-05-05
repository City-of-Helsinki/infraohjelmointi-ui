import { IOption } from '@/interfaces/common';
import { FC, memo, useCallback, useRef } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { HookFormControlType, HookFormRulesType } from '@/interfaces/formInterfaces';
import { Select as HDSSelect } from 'hds-react/components/Select';
import { IconCrossCircle, IconLocation, IconUser } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';

const getIcon = (icon?: string) => {
  if (icon === 'location') {
    return <IconLocation />;
  } else if (icon === 'person') {
    return <IconUser />;
  } else {
    return undefined;
  }
};

interface ISelectFieldProps {
  name: string;
  control: HookFormControlType;
  options: Array<IOption>;
  label?: string;
  rules?: HookFormRulesType;
  hideLabel?: boolean;
  icon?: string;
  placeholder?: string;
  clearable?: boolean;
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
  clearable,
}) => {
  const required = rules?.required ? true : false;
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        return (
          <div className="input-wrapper" id={name} data-testid={name}>
            <div className="select-field-wrapper" ref={selectContainerRef}>
              <HDSSelect
                className="input-l custom-select"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                label={!hideLabel && label && t(label)}
                invalid={error ? true : false}
                error={error?.message}
                options={options ?? []}
                required={required}
                style={{ paddingTop: hideLabel ? '1.745rem' : '0' }}
                placeholder={(placeholder && t(placeholder ?? '')) ?? ''}
                icon={getIcon(icon)}
              />

              {value.value && (
                // top should be => top: 1rem; with hds in project header
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
      rules={rules}
    />
  );
};

export default memo(SelectField);
