import { IOptionType, SelectCallback } from '@/interfaces/common';
import { ProjectType } from '@/interfaces/projectCardInterfaces';
import { Select } from 'hds-react/components/Select';
import { Tag } from 'hds-react/components/Tag';
import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Span, Title } from '../shared';

interface INetworkNumberRowProps {
  label: string;
  value: string;
}

const NetworkNumberRow: FC<INetworkNumberRowProps> = ({ label, value }) => (
  <div className="nn-row">
    <label className="nn-label">{label}</label>
    <Span size="m" text={value} />
  </div>
);

const NetworkNumbers = () => {
  const networkNumber = [
    {
      label: 'RAKE',
      value: 'A39390033390',
    },
    {
      label: 'MAKA',
      value: 'A28930988284',
    },
    {
      label: 'Toim.ohj.',
      value: 'B39838939923',
    },
  ];

  return (
    <div className="display-flex-col">
      <legend className="legend-margin">Verkkonumerot</legend>
      {networkNumber.map((nn) => (
        <NetworkNumberRow key={nn.label} {...nn} />
      ))}
    </div>
  );
};

const Identifiers = () => {
  const tags = ['uudisrakentaminen', 'pyöräily', 'pohjoinensuurpiiri', 'ylitysoikeus2021'];
  return (
    <div className="display-flex-col">
      <label className="identifiers-label">Tunnisteet</label>
      <div className="tags-container">
        {tags.map((t) => (
          <div key={t} className="tag-wrapper">
            <Tag>{t}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
};

type InputSizeType = 'l' | 'm';

interface ITextInputProps {
  label: string;
  value: string;
  size?: InputSizeType;
  placeholder?: string;
  required?: boolean;
}

const TextInput: FC<ITextInputProps> = ({ label, value, size, placeholder, required }) => {
  return (
    <div className="input-wrapper">
      <HDSTextInput
        className={`input-${size || 'l'}`}
        label={label}
        placeholder={placeholder}
        id={label}
        required={required}
        value={value}
      />
    </div>
  );
};

interface IDropdownOptions {
  options: Array<IOptionType>;
  selectedOption: string;
  onChange: SelectCallback;
  icon?: ReactNode;
  size?: InputSizeType;
}

const Dropdown: FC<IDropdownOptions> = ({ options, selectedOption, onChange, icon, size }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* FIXME: this hack is here because HDS-Select component doesn't re-rendering the defaultValue */}
      {selectedOption && (
        <div className="input-wrapper">
          <Select
            className={`input-${size || 'l'}`}
            label=""
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

const ProjectCardBasicsForm = () => {
  const { t } = useTranslation();
  const [projectType, setProjectType] = useState('projectComplex');

  const getProjectTypes = () => {
    const phaseOptions: Array<IOptionType> = [];
    Object.values(ProjectType).map((p) => phaseOptions.push({ label: t(`enums.${p}`) }));
    return phaseOptions;
  };

  return (
    <div className="basics-form">
      <div className="input-wrapper">
        <Title size="l" text="Hankkeen perustiedot" />
      </div>
      <div className="display-flex">
        {/* First 4 form fields */}
        <div className="basics-form-column">
          <Dropdown
            options={getProjectTypes()}
            selectedOption={projectType}
            onChange={(o) => setProjectType(o.label)}
          />
          <TextInput label={'Hankekokonaisuuden nimi'} value={''} />
          <div className="input-wrapper">
            <HDSTextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div className="input-wrapper">
            <HDSTextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div className="input-wrapper">
            <HDSTextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
        </div>
        {/* Readonly Fields next to first 4 fields */}
        <div className="basics-form-column">
          <div className="input-wrapper">
            <HDSTextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              readOnly
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <div className="input-wrapper">
            <HDSTextInput
              style={{ maxWidth: '360px' }}
              id="textinput"
              readOnly
              label="Hankekokonaisuuden nimi"
              placeholder="Placeholder"
            />
          </div>
          <NetworkNumbers />
        </div>
      </div>
      {/* Tags */}
      <Identifiers />
    </div>
  );
};

export default ProjectCardBasicsForm;
