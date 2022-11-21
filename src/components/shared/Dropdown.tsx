import { InputSizeType, IOptionType, SelectCallback } from '@/interfaces/common';
import { Select } from 'hds-react/components/Select';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface IDropdownOptions {
  options: Array<IOptionType>;
  selectedOption: string;
  onChange: SelectCallback;
  label?: string;
  icon?: ReactNode;
  size?: InputSizeType;
}

const Dropdown: FC<IDropdownOptions> = (props) => {
  const { t } = useTranslation();
  const { options, selectedOption, onChange, label, icon, size } = props;
  return (
    <>
      {/* FIXME: this hack is here because HDS-Select component doesn't re-rendering the defaultValue */}
      {selectedOption && (
        <div className="input-wrapper">
          <Select
            className={`input-${size || 'l'}`}
            label={label || ''}
            defaultValue={{ label: t(`enums.${selectedOption}`) }}
            icon={icon}
            placeholder={t('projectPhase') || ''}
            options={options}
            onChange={onChange}
          />
        </div>
      )}
    </>
  );
};

export default Dropdown;
