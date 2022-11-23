import { FormField, IForm } from '@/interfaces/formInterfaces';
import { Tag } from 'hds-react/components/Tag';
import { IconPenLine } from 'hds-react/icons';
import { FC, useState, MouseEvent, MouseEventHandler } from 'react';
import FormSectionTitle from './FormSectionTitle';
import SelectField from './SelectField';
import Span from './Span';
import TextField from './TextField';

interface IFormFieldCreatorProps {
  form: Array<IForm>;
}

interface IPenAndLabelProps {
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

/**
 * TODO: this should be its own generic form component.
 * We still don't know how this should work when editing, so this doesn't have its own generic form-component yet.
 */
const PenAndLabel: FC<IPenAndLabelProps> = ({ text, onClick }) => {
  return (
    <div style={{ display: 'flex' }}>
      <label>{text}</label>
      <button onClick={onClick}>
        <IconPenLine style={{ transform: 'translate(20px, -6px)' }} />
      </button>
    </div>
  );
};

/**
 * TODO: this should be its own generic form component.
 * We still don't know how this should work when editing, so this doesn't have its own generic form-component yet.
 */
const NetworkNumbers = ({ name }: { name: string }) => {
  // Temp values until API returns / enables these
  const [networkNumbers, setNetworkNumber] = useState([
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
  ]);

  const addNetworkNumber = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setNetworkNumber([...networkNumbers, { label: 'TESTI', value: 'X56838939563' }]);
  };

  return (
    <div className="display-flex-col" id={name}>
      <PenAndLabel text="Verkkonumerot" onClick={(e) => addNetworkNumber(e)} />
      {networkNumbers.map((nn) => (
        <div className="nn-row" key={nn.label}>
          <label className="nn-label">{nn.label}</label>
          <Span size="m" text={nn.value} />
        </div>
      ))}
    </div>
  );
};

/**
 * TODO: this should be its own generic form component.
 * We still don't know how this should work when editing, so this doesn't have its own generic form-component yet.
 */
const Identifiers = ({ name }: { name: string }) => {
  // TODO: add to utils/common Temp values until API returns / enables these
  const [tags, setTags] = useState(['uudisrakentaminen', 'pyöräily', 'pohjoinensuurpiiri']);

  const onEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTags([...tags, 'testi']);
  };

  return (
    <div className="input-wrapper" id={name}>
      <div className="display-flex-col">
        <PenAndLabel text={'Tunnisteet'} onClick={(e) => onEdit(e)} />
        <div className="tags-container">
          {tags.map((t) => (
            <div key={t} className="tag-wrapper">
              <Tag>{t}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FormFieldCreator: FC<IFormFieldCreatorProps> = ({ form }) => {
  return (
    <>
      {form.map((f) => {
        const { type, options, ...formProps } = f;
        switch (type) {
          case FormField.Select:
            return <SelectField key={f.name} options={options} {...formProps} />;
          case FormField.Text:
            return <TextField key={f.name} {...formProps} />;
          case FormField.Title:
            return <FormSectionTitle key={f.name} label={f.label} />;
          case FormField.NetworkNumbers:
            return <NetworkNumbers key={f.name} name={f.name} />;
          case FormField.Identifiers:
            return <Identifiers key={f.name} name={f.name} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default FormFieldCreator;
