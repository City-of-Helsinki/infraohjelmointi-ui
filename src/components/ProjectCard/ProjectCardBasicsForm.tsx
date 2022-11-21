import { InputSizeType, IOptionType } from '@/interfaces/common';
import { ProjectType } from '@/interfaces/projectCardInterfaces';
import { Tag } from 'hds-react/components/Tag';
import { TextInput as HDSTextInput } from 'hds-react/components/TextInput';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Span, Title } from '../shared';

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

interface ITextInputProps {
  label: string;
  value: string;
  size?: InputSizeType;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}

const TextInput: FC<ITextInputProps> = (props) => {
  const { label, value, size, placeholder, required, readOnly } = props;
  return (
    <div className="input-wrapper">
      <HDSTextInput
        className={`input-${size || 'l'}`}
        label={label}
        placeholder={placeholder}
        id={label}
        required={required}
        value={value}
        readOnly={readOnly}
      />
    </div>
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
            label="Hanketyyppi"
            onChange={(o) => setProjectType(o.label)}
          />
          <TextInput label={'Hankkeen kuvaus'} value={''} required />
          <TextInput label={'Hankekokonaisuuden nimi'} value={''} />
          <Dropdown
            options={getProjectTypes()}
            selectedOption={projectType}
            label="Projektialue"
            onChange={(o) => setProjectType(o.label)}
          />
        </div>
        {/* Readonly Fields next to first 4 fields */}
        <div className="basics-form-column">
          <TextInput label={'PW Hanketunnus'} value={'2850'} readOnly />
          <TextInput label={'PW Hanketunnus'} value={'3893892'} readOnly />
          <NetworkNumbers />
        </div>
      </div>
      {/* Tags */}
      <Identifiers />
    </div>
  );
};

export default ProjectCardBasicsForm;
